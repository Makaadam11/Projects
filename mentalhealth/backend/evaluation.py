import pandas as pd
import numpy as np
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.impute import KNNImputer
from sklearn.metrics import classification_report, roc_auc_score,roc_curve, auc, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from imblearn.over_sampling import SMOTE
import warnings
from sklearn.model_selection import KFold
import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib
matplotlib.use('Agg')  # Set backend before importing pyplot


def clean_and_encode_data(df, numeric_features, categorical_features):
    """Clean and encode all data before splitting"""
    # Handle numeric features first
    for col in numeric_features:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Convert actual to numeric for KNN imputer
    df['actual'] = df['actual'].map({'Yes': 1, 'No': 0, 1: 1, 0: 0})
    df['actual'] = pd.to_numeric(df['actual'], errors='coerce')
    
    # Add actual to numeric features for imputation
    numeric_with_actual = numeric_features + ['actual']
    
    # Use KNN imputer for numeric features and actual
    imputer = KNNImputer(n_neighbors=5)
    df[numeric_with_actual] = imputer.fit_transform(df[numeric_with_actual])
    
    # Round actual values after imputation
    df['actual'] = df['actual'].round().astype(int)
    
    # Handle categorical features
    encoders = {}
    for col in categorical_features:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].mode()[0])
            df[col] = df[col].astype(str)
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            encoders[col] = le
            
    return df, encoders

def plot_model_metrics(y_true, y_pred_proba, model_name):
    """Plot ROC, KS, Gain and Lift charts"""
    # Create figure with specified backend
    plt.switch_backend('Agg')
    fig = plt.figure(figsize=(15, 10))
    
    # ROC Curve
    fpr, tpr, _ = roc_curve(y_true, y_pred_proba)
    roc_auc = auc(fpr, tpr)
    
    plt.figure(figsize=(15, 10))
    
    # Plot ROC
    plt.subplot(2, 2, 1)
    plt.plot(fpr, tpr, label=f'ROC curve (AUC = {roc_auc:.2f})')
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'ROC Curve - {model_name}')
    plt.legend()
    
    # KS Chart
    plt.subplot(2, 2, 2)
    plt.plot(fpr, tpr, label='Positive Class')
    plt.plot(fpr, fpr, 'r--', label='Negative Class')
    ks_stat = max(tpr - fpr)
    plt.plot([fpr[np.argmax(tpr - fpr)]], [tpr[np.argmax(tpr - fpr)]], 'bo', 
             label=f'KS = {ks_stat:.3f}')
    plt.xlabel('Score')
    plt.ylabel('Cumulative %')
    plt.title('Kolmogorov-Smirnov Chart')
    plt.legend()
    
    # Gain Chart
    plt.subplot(2, 2, 3)
    percentile = np.arange(0, 100, 1)
    gain = np.percentile(y_pred_proba, percentile)
    plt.plot(percentile, gain)
    plt.plot([0, 100], [0, 1], 'k--')
    plt.xlabel('Population %')
    plt.ylabel('Gain')
    plt.title('Gain Chart')
    
    # Lift Chart
    plt.subplot(2, 2, 4)
    lift = gain / (percentile/100)
    plt.plot(percentile, lift)
    plt.xlabel('Population %')
    plt.ylabel('Lift')
    plt.title('Lift Chart')
    
    plt.tight_layout()
    # Save and close with non-GUI backend
    plt.savefig(f'metrics_{model_name}.png', backend='Agg')
    plt.close(fig)
    
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
            'level_of_study', 'gender', 'ethnic_group',
            'family_earning_class', 'financial_support',
            'home_country', 'course_of_study', 'feel_afraid',
            'timetable_impact', 'student_type_location',
            'sense_of_belonging'
        ]

        print(len(df), " df ")
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
        y = df['predictions'].values
        
        print(len(X), " X total")
        print(len(y), " y total")
        
        # Split data for validation maybe increase test size
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, random_state=42, stratify=y
        )
        print(len(X_train), " xtrain", len(X_test), " xtest", len(y_train), " ytrain", len(y_test), " ytest")
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
                n_estimators=600,
                max_depth=40,
                min_samples_split=3,
                class_weight='balanced',
                random_state=24
            ),
            'NeuralNetwork': MLPClassifier(
                hidden_layer_sizes=(400,150,50),  # Głębsza sieć
                max_iter=2000,
                early_stopping=True,
                random_state=42
            ),
            # 'SVM': SVC(
            #     kernel='rbf',
            #     C=5.0,  # Zwiększ C dla lepszego dopasowania
            #     class_weight='balanced',
            #     probability=True,
            #     random_state=42
            # )
        }
        
        # Convert DataFrame to numpy array before splitting
        X_array = X_train_resampled.to_numpy()
        y_array = y_train_resampled
        
        # K-fold cross-validation
        kf = KFold(n_splits=10, shuffle=True, random_state=42)
        
        for idx, (name, model) in enumerate(models.items()):
            cv_scores = []
            f1_scores = []
            for train_idx, val_idx in kf.split(X_array):
                X_fold_train, X_fold_val = X_array[train_idx], X_array[val_idx]
                y_fold_train, y_fold_val = y_array[train_idx], y_array[val_idx]
                
                model.fit(X_fold_train, y_fold_train)
                if hasattr(model, "predict_proba"):
                    y_pred_proba = model.predict_proba(X_fold_val)[:, 1]
                else:
                    y_pred_proba = model.decision_function(X_fold_val)
                    
                cv_scores.append(roc_auc_score(y_fold_val, y_pred_proba))
                y_fold_pred = model.predict(X_fold_val)
                f1_scores.append.f1_score(y_fold_val, y_fold_pred)
            
            print(f"\n{name} Cross-validation ROC AUC: {np.mean(cv_scores):.3f} (+/- {np.std(cv_scores)*2:.3f})")
            print(f"Fold F1 Score: {np.mean(f1_scores):.3f}")
            
            # Train final model and plot metrics
            model.fit(X_train_resampled, y_train_resampled)
            if hasattr(model, "predict_proba"):
                test_pred_proba = model.predict_proba(X_test)[:, 1]
            else:
                test_pred_proba = model.decision_function(X_test)
                
            plot_model_metrics(y_test, test_pred_proba, name)
        
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
            
            # Calculate training metrics
            train_pred = model.predict(X_train_resampled)
            print("\nTraining Set Metrics:")
            print(f"Accuracy: {accuracy_score(y_train_resampled, train_pred):.2f}")
            print(f"Precision: {precision_score(y_train_resampled, train_pred):.2f}")
            print(f"Recall: {recall_score(y_train_resampled, train_pred):.2f}")
            print(f"F1 Score: {f1_score(y_train_resampled, train_pred):.2f}")
            print("\nConfusion Matrix:")
            print(confusion_matrix(y_train_resampled, train_pred))
            print("\nClassification Report:")
            print(classification_report(y_train_resampled, train_pred))
            
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
        df = pd.read_excel("C:/Projects/mentalhealth/data/pre_evaluation_dataset.xlsx")
        print(f"Loaded dataset with {len(df)} rows")
        
        models, df_processed = evaluate_models(df)
        df_processed.to_excel("C:/Projects/mentalhealth/data/evaluated_dataset.xlsx", index=False)
        print("\nEvaluation completed successfully")
        
        report_df = pd.read_excel("C:/Projects/mentalhealth/data/report_data_test.xlsx")
        report_df['predictions'] = df_processed['predictions']
        
        # Save updated report
        report_df.to_excel("C:/Projects/mentalhealth/data/report_data_test.xlsx", index=False)
        print("\nPredictions added to report data")
    except Exception as e:
        print(f"Error in main execution: {str(e)}")
        raise

if __name__ == "__main__":
    main()