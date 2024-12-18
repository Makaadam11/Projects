import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.impute import KNNImputer
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from imblearn.over_sampling import SMOTE
import warnings

def clean_and_encode_data(df, numeric_features, categorical_features):
    """Clean and encode all data before splitting"""
    # Handle actual column
    df['actual'] = df['actual'].fillna('No')
    df['actual'] = df['actual'].map({'Yes': 1, 'No': 0, 1: 1, 0: 0}).fillna(0)
    
    # Handle numeric features
    for col in numeric_features:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Use KNN imputer for numeric features
    imputer = KNNImputer(n_neighbors=5)
    df[numeric_features] = imputer.fit_transform(df[numeric_features])
    
    # Handle categorical features
    encoders = {}
    for col in categorical_features:
        if col in df.columns:
            # Fill NaN values with mode
            df[col] = df[col].fillna(df[col].mode()[0])
            df[col] = df[col].astype(str)
            
            # Fit encoder on all data
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            encoders[col] = le
    
    return df, encoders

def evaluate_models(df, suppress_warnings=True):
    if suppress_warnings:
        warnings.filterwarnings('ignore')
    
    try:
        selected_numeric_features = [
            'age', 'hours_socialising', 'hours_socialmedia', 
            'total_device_hours', 'hours_per_week_university_work',
            'exercise_per_week', 'work_hours_per_week',
            'hours_between_lectures', 'hours_per_week_lectures',
            'cost_of_study'
        ]
        
        selected_categorical_features = [
            'stress_in_general', 'stress_before_exams', 
            'financial_problems', 'personality_type', 
            'quality_of_life', 'known_disabilities',
            'diet', 'alcohol_consumption', 'well_hydrated',
            'timetable_preference', 'physical_activities',
            'form_of_employment', 'student_type_time',
            'level_of_study', 'gender', 'ethnic_group'
        ]

        # Preprocess entire dataset
        df, encoders = clean_and_encode_data(df, selected_numeric_features, selected_categorical_features)
        
        # Split after preprocessing
        diagnosed = df[df['actual'] == 1].copy()
        undiagnosed = df[df['actual'] == 0].copy()
        
        print(f"\nInitial statistics:")
        print(f"Total cases: {len(df)}")
        print(f"Diagnosed cases (actual=1): {len(diagnosed)} ({len(diagnosed)/len(df)*100:.2f}%)")
        print(f"Undiagnosed cases: {len(undiagnosed)} ({len(undiagnosed)/len(df)*100:.2f}%)")
        
        # Prepare features for full dataset
        X = df[selected_numeric_features + selected_categorical_features]
        y = df['actual'].values
        
        # Split data for validation
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train[selected_numeric_features] = scaler.fit_transform(X_train[selected_numeric_features])
        X_test[selected_numeric_features] = scaler.transform(X_test[selected_numeric_features])
        
        # Apply SMOTE only to training data
        smote = SMOTE(random_state=42)
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

        # Updated models with better parameters
        models = {
            'RandomForest': RandomForestClassifier(
                n_estimators=200, 
                max_depth=10,
                min_samples_split=5,
                class_weight='balanced',
                random_state=42
            ),
            'NeuralNetwork': MLPClassifier(
                hidden_layer_sizes=(200,100),
                max_iter=1000,
                early_stopping=True,
                random_state=42
            ),
            'SVM': SVC(
                kernel='rbf',
                C=1.0,
                class_weight='balanced',
                probability=True,
                random_state=42
            )
        }
        
        # Initialize predictions array for undiagnosed cases
        predictions = np.zeros((len(undiagnosed), len(models)))
        
       # Train and predict with metrics
        for idx, (name, model) in enumerate(models.items()):
            print(f"\nTraining and evaluating {name}...")
            
            # Cross-validation scores
            cv_scores = cross_val_score(model, X_train_resampled, y_train_resampled, cv=5)
            print(f"Cross-validation accuracy: {cv_scores.mean():.2f} (+/- {cv_scores.std() * 2:.2f})")
            
            # Train model
            model.fit(X_train_resampled, y_train_resampled)
            
            # Predictions on test set
            test_pred = model.predict(X_test)
            
            # Calculate metrics
            print("\nTest Set Metrics:")
            print(f"Accuracy: {accuracy_score(y_test, test_pred):.2f}")
            print(f"Precision: {precision_score(y_test, test_pred):.2f}")
            print(f"Recall: {recall_score(y_test, test_pred):.2f}")
            print(f"F1 Score: {f1_score(y_test, test_pred):.2f}")
            print("\nConfusion Matrix:")
            print(confusion_matrix(y_test, test_pred))
            print("\nClassification Report:")
            print(classification_report(y_test, test_pred))
            
            # Predict undiagnosed cases
            X_undiagnosed = undiagnosed[selected_numeric_features + selected_categorical_features]
            predictions[:, idx] = model.predict(X_undiagnosed)
            predicted_positive = sum(predictions[:, idx] == 1)
            print(f"\nPredictions for Undiagnosed Cases:")
            print(f"Predicted positive cases: {predicted_positive} ({predicted_positive/len(undiagnosed)*100:.2f}%)")
                
        # Ensemble predictions for undiagnosed cases
        final_predictions = np.where(predictions.mean(axis=1) >= 0.5, 1, 0)
        
        # Combine results
        undiagnosed['predictions'] = final_predictions
        diagnosed['predictions'] = 1  # All diagnosed cases remain positive
        
        result_df = pd.concat([diagnosed, undiagnosed])
        
        print(f"\nFinal Results:")
        print(f"Original diagnosed cases: {len(diagnosed)}")
        print(f"Newly identified potential cases: {sum(final_predictions == 1)}")
        print(f"Total identified cases: {len(diagnosed) + sum(final_predictions == 1)}")
        
        return models, result_df
        
    except Exception as e:
        print(f"Error in model evaluation: {str(e)}")
        raise   

def main():
    try:
        df = pd.read_excel("C:/Projects/mentalhealth/data/merged_dataset.xlsx")
        print(f"Loaded dataset with {len(df)} rows")
        
        models, df_processed = evaluate_models(df)
        df_processed.to_excel("C:/Projects/mentalhealth/data/evaluated_dataset.xlsx", index=False)
        print("\nEvaluation completed successfully")
        
    except Exception as e:
        print(f"Error in main execution: {str(e)}")
        raise

if __name__ == "__main__":
    main()