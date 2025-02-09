import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from imblearn.over_sampling import SMOTE
from sklearn.impute import SimpleImputer
import joblib
import warnings
import os

def clean_and_encode_data(df, numeric_features, categorical_features):
    """Clean and encode all data before splitting"""
    # Remove actual from numeric features if present
    if 'actual' in numeric_features:
        numeric_features.remove('actual')
    
    # Handle numeric features first
    for col in numeric_features:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Convert actual to numeric - simplified mapping
    df['actual'] = df['actual'].map({'Yes': 1, 'No': 0, 1: 1, 0: 0})
    
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

def train_and_save_model(X_train, y_train, model_type='RandomForest', suffix=''):
    """Train the model and save it to a .sav file"""
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        
        if model_type.endswith('_smote') or model_type.endswith('_original'):
            model_type = model_type.replace('_smote', '').replace('_original', '')
        
        if model_type == 'RandomForest':
            # Define the parameter grid for RandomizedSearchCV
            n_estimators = [int(x) for x in np.linspace(start=100, stop=1000, num=10)]
            max_features = ['auto', 'sqrt', 'log2']
            max_depth = [int(x) for x in np.linspace(10, 110, num=11)]
            max_depth.append(None)
            min_samples_split = [2, 5, 10]
            min_samples_leaf = [1, 2, 4]
            bootstrap = [True, False]
            random_grid = {
                'n_estimators': n_estimators,
                'max_features': max_features,
                'max_depth': max_depth,
                'min_samples_split': min_samples_split,
                'min_samples_leaf': min_samples_leaf,
                'bootstrap': bootstrap
            }

            # Perform RandomizedSearchCV to find the best parameters for RandomForest
            rf = RandomForestClassifier()
            model_random = RandomizedSearchCV(estimator=rf, param_distributions=random_grid, n_iter=100, cv=3, verbose=0, random_state=42, n_jobs=-1)
        elif model_type == 'NeuralNetwork':
            # Define the parameter grid for RandomizedSearchCV
            hidden_layer_sizes = [(50,50,50), (50,100,50), (100,), (150, 100, 50)]
            activation = ['tanh', 'relu']
            solver = ['sgd', 'adam']
            alpha = [0.0001, 0.05, 0.01]
            learning_rate = ['constant','adaptive']
            random_grid = {
                'hidden_layer_sizes': hidden_layer_sizes,
                'activation': activation,
                'solver': solver,
                'alpha': alpha,
                'learning_rate': learning_rate
            }

            # Perform RandomizedSearchCV to find the best parameters for MLPClassifier
            model = MLPClassifier(max_iter=300)
            model_random = RandomizedSearchCV(estimator=model, param_distributions=random_grid, n_iter=100, cv=3, verbose=0, random_state=42, n_jobs=-1)
        else:
            raise ValueError(f"Unsupported model type: {model_type}")

        model_random.fit(X_train, y_train)
        best_model = model_random.best_estimator_

        # Save the model to disk with the suffix
        model_filename = f'{model_type}_{suffix}_model.sav'
        joblib.dump(best_model, model_filename)
        print(f"Saved {model_type} model to {model_filename}")

def evaluate_data(df, suppress_warnings=True):
    if suppress_warnings:
        warnings.filterwarnings('ignore')
    
    try:
        # Define correct column names in order
        correct_columns = [
            'diet', 'ethnic_group', 'hours_per_week_university_work',
            'family_earning_class', 'quality_of_life', 'alcohol_consumption',
            'personality_type', 'stress_in_general', 'well_hydrated',
            'exercise_per_week', 'known_disabilities', 'work_hours_per_week',
            'financial_support', 'form_of_employment', 'financial_problems',
            'home_country', 'age', 'course_of_study', 'stress_before_exams',
            'feel_afraid', 'timetable_preference', 'timetable_reasons',
            'timetable_impact', 'total_device_hours', 'hours_socialmedia',
            'level_of_study', 'gender', 'physical_activities',
            'hours_between_lectures', 'hours_per_week_lectures',
            'hours_socialising', 'actual', 'student_type_time',
            'student_type_location', 'cost_of_study', 'sense_of_belonging',
            'mental_health_activities', 'source', 'predictions', 'captured_at'
        ]
        
        # Set new column names
        df.columns = correct_columns
        print("Column names set successfully.")
        
        # Verify no quotes remain
        if any("'" in col for col in df.columns):
            print("Warning: Some columns still contain quotes")
        
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

        # Verify required columns exist
        missing_columns = [col for col in selected_numeric_features + selected_categorical_features + ['actual'] 
                         if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        print("Required columns verified successfully.")

        # Handle 'actual' column before other processing
        if 'actual' in df.columns:
            print("Processing 'actual' column...")
            print("Original data shape:", df.shape)
            print("Original actual value counts:")
            print(df['actual'].value_counts())
            
            # Keep only Yes/No responses
            df_yes_no = df[df['actual'].isin(['Yes', 'No', 1, 0])].copy()
            df_yes_no['actual'] = df_yes_no['actual'].map({'Yes': 1, 'No': 0, 1: 1, 0: 0})
            df_yes_no = df_yes_no.dropna(subset=['actual'])
            
            print("\nAfter filtering actual column:")
            print("New data shape:", df_yes_no.shape)
            print("New actual value counts:")
            print(df_yes_no['actual'].value_counts())
            
            print("Processed 'actual' column successfully.")

        # Exclude specific columns
        exclude_columns = ['mental_health_activities', 'timetable_reasons', 'source', 'captured_at']
        df_yes_no = df_yes_no.drop(columns=[col for col in exclude_columns if col in df_yes_no.columns])
        print("Excluded specific columns successfully.")

        # Preprocess entire dataset
        df_yes_no, encoders = clean_and_encode_data(df_yes_no, selected_numeric_features, selected_categorical_features)
        print("Preprocessed dataset successfully.")
        
        df_yes_no.to_excel('encoded_cleaned_data.xlsx', index=False)
        print("Saved encoded and cleaned data to 'encoded_cleaned_data.xlsx'.")
        
        # Prepare features
        X = df_yes_no[selected_numeric_features + selected_categorical_features]
        y = df_yes_no['actual'].values
        
        # Verify we have data
        if len(X) == 0:
            raise ValueError("No valid data available for training")
        
        print(f"\nProcessed data statistics:")
        print(f"Training data size: {len(X)}")
        
        # Train test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, random_state=42, stratify=y
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = X_train.copy()
        X_test_scaled = X_test.copy()
        X_train_scaled[selected_numeric_features] = scaler.fit_transform(X_train[selected_numeric_features])
        X_test_scaled[selected_numeric_features] = scaler.transform(X_test[selected_numeric_features])
        
        # Apply SMOTE to training data
        smote = SMOTE(random_state=42)
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train_scaled, y_train)
        
        print(f"Number of records before SMOTE: {len(X_train)}")
        print(f"Number of records after SMOTE: {len(X_train_resampled)}")
        
        # Train and save models
        models = ['RandomForest', 'NeuralNetwork']
        for model_type in models:
            # Train and save model without SMOTE
            print(f"\nTraining and evaluating {model_type} model without SMOTE...")
            train_and_save_model(X_train_scaled, y_train, model_type=f"{model_type}", suffix="original")
            
            # Train and save model with SMOTE
            print(f"\nTraining and evaluating {model_type} model with SMOTE...")
            train_and_save_model(X_train_resampled, y_train_resampled, model_type=f"{model_type}", suffix="smote")
        
        # Load model and predict
        for model_type in models:
            for smote_type in ['original', 'smote']:
                model_filename = f'{model_type}_{smote_type}_model.sav'
                if not os.path.exists(model_filename):
                    raise FileNotFoundError(f"No such file or directory: '{model_filename}'")
                model = joblib.load(model_filename)
                
                # Cross-validation scores
                cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
                print(f"Cross-validation accuracy for {model_type} ({smote_type}): {cv_scores.mean():.2f} (+/- {cv_scores.std() * 2:.2f})")
                
                # Train model
                model.fit(X_train_scaled, y_train)
                print(f"Trained {model_type} model ({smote_type}) successfully.")
                
                # Predictions on test set
                y_test_pred = model.predict(X_test_scaled)
                
                # Calculate metrics for test set
                print(f"\nTest Set Metrics for {model_type} ({smote_type}):")
                print(f"Accuracy: {accuracy_score(y_test, y_test_pred):.2f}")
                print(f"Precision: {precision_score(y_test, y_test_pred):.2f}")
                print(f"Recall: {recall_score(y_test, y_test_pred):.2f}")
                print(f"F1 Score: {f1_score(y_test, y_test_pred):.2f}")
                print("\nConfusion Matrix:")
                print(confusion_matrix(y_test, y_test_pred))
                print("\nClassification Report:")
                print(classification_report(y_test, y_test_pred))
                
                # Predictions on training set
                y_train_pred = model.predict(X_train_scaled)
                
                # Calculate metrics for training set
                print(f"\nTraining Set Metrics for {model_type} ({smote_type}):")
                print(f"Accuracy: {accuracy_score(y_train, y_train_pred):.2f}")
                print(f"Precision: {precision_score(y_train, y_train_pred):.2f}")
                print(f"Recall: {recall_score(y_train, y_train_pred):.2f}")
                print(f"F1 Score: {f1_score(y_train, y_train_pred):.2f}")
                print("\nConfusion Matrix:")
                print(confusion_matrix(y_train, y_train_pred))
                print("\nClassification Report:")
                print(classification_report(y_train, y_train_pred))
        
                # Prepare entire dataset for prediction
        df_full, encoders = clean_and_encode_data(df, selected_numeric_features, selected_categorical_features)
        X_full = df_full[selected_numeric_features + selected_categorical_features]
        
        # Define and fit the imputer
        imputer = SimpleImputer(strategy='mean')
        X_full = imputer.fit_transform(X_full)
        
        # Scale only the numeric features
        X_full_scaled = X_full.copy()
        X_full_scaled[:, :len(selected_numeric_features)] = scaler.transform(X_full[:, :len(selected_numeric_features)])
        
        df_full['predictions'] = model.predict(X_full_scaled)
        
        # Save results
        df_full.to_excel('final_results.xlsx', index=False)
        print("Saved final results to 'final_results.xlsx'.")
        
        print(f"\nFinal Results for {model_type}:")
        print(f"Original diagnosed cases: {len(df_full[df_full['actual'] == 1])}")
        print(f"Newly identified potential cases: {(df_full['predictions'] == 1).sum()}")
        print(f"Total identified cases: {len(df_full[df_full['actual'] == 1]) + (df_full['predictions'] == 1).sum()}")
        
        # Print predictions count after evaluation
        print("Predictions count after evaluation:")
        print(df_full['predictions'].value_counts())
        
        # Print count of predictions equal to 0 and 1
        print("Count of predictions equal to 0:", (df_full['predictions'] == 0).sum())
        print("Count of predictions equal to 1:", (df_full['predictions'] == 1).sum())
        
        # Print count of predictions equal to 0 and 1
        print("Count of predictions equal to 0:", (df_full['predictions'] == 0).sum())
        print("Count of predictions equal to 1:", (df_full['predictions'] == 1).sum())
        
        # Print count of actual values equal to 0 and 1
        if 'actual' in df_full.columns:
            print("Count of actual values equal to 0:", (df_full['actual'] == 0).sum())
            print("Count of actual values equal to 1:", (df_full['actual'] == 1).sum())
        else:
            print("Column 'actual' not found in df_full")
        
        return df_full

    except Exception as e:
        print(f"Error in model evaluation: {str(e)}")
        raise