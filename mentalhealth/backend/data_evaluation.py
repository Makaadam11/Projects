import pandas as pd
import numpy as np
from sklearn.model_selection import RandomizedSearchCV, cross_val_score, train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.impute import KNNImputer
from sklearn.metrics import classification_report, roc_auc_score, roc_curve, auc, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
from imblearn.over_sampling import SMOTE
import warnings
from sklearn.model_selection import KFold
import matplotlib.pyplot as plt
import seaborn as sns
import matplotlib
import joblib
import os

matplotlib.use('Agg')  # Set backend before importing pyplot

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
    ks_point = (fpr[np.argmax(tpr - fpr)], tpr[np.argmax(tpr - fpr)])
    plt.plot([ks_point[0]], [ks_point[1]], 'bo', label=f'KS = {ks_stat:.3f}')
    plt.xlabel('Score')
    plt.ylabel('Cumulative %')
    plt.title('Kolmogorov-Smirnov Chart')
    plt.legend()
    
    # Gain Chart
    plt.subplot(2, 2, 3)
    sorted_indices = np.argsort(y_pred_proba)
    sorted_proba = y_pred_proba[sorted_indices]
    sorted_true = y_true[sorted_indices]
    cumulative_true = np.cumsum(sorted_true)
    gain = cumulative_true / cumulative_true[-1]
    plt.plot(np.linspace(0, 100, len(gain)), gain, label=f'Gain = {gain[-1]:.2f}')
    plt.plot([0, 100], [0, 1], 'k--')
    plt.xlabel('Population %')
    plt.ylabel('Gain')
    plt.title('Gain Chart')
    plt.legend()
    
    # Lift Chart
    plt.subplot(2, 2, 4)
    lift = gain / (np.linspace(0, 100, len(gain)) / 100)
    plt.plot(np.linspace(0, 100, len(lift)), lift, label=f'Lift = {lift[-1]:.2f}')
    plt.xlabel('Population %')
    plt.ylabel('Lift')
    plt.title('Lift Chart')
    plt.legend()
    
    plt.tight_layout()
    # Save and close with non-GUI backend
    plt.savefig(f'metrics_{model_name}.png', backend='Agg')
    plt.close(fig)

def train_and_save_model(X_train, y_train, model_type='RandomForest'):
    """Train the model and save it to a .sav file"""
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
        model_random = RandomizedSearchCV(estimator=rf, param_distributions=random_grid, n_iter=100, cv=3, verbose=2, random_state=42, n_jobs=-1)
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
        model_random = RandomizedSearchCV(estimator=model, param_distributions=random_grid, n_iter=100, cv=3, verbose=2, random_state=42, n_jobs=-1)
    elif model_type == 'SVM':
        # Define the parameter grid for RandomizedSearchCV
        C = [0.1, 1, 10, 100, 1000]
        gamma = [1, 0.1, 0.01, 0.001, 0.0001]
        kernel = ['rbf', 'poly', 'sigmoid']
        random_grid = {
            'C': C,
            'gamma': gamma,
            'kernel': kernel
        }

        # Perform RandomizedSearchCV to find the best parameters for SVC
        model = SVC(probability=True)
        model_random = RandomizedSearchCV(estimator=model, param_distributions=random_grid, n_iter=100, cv=3, verbose=2, random_state=42, n_jobs=-1)

    model_random.fit(X_train, y_train)
    best_model = model_random.best_estimator_

    # Save the model to disk
    joblib.dump(best_model, f'{model_type}_model.sav')
    print(f"Saved {model_type} model to {model_type}_model.sav")

def clean_and_encode_data(df, numeric_features, categorical_features):
    """Clean and encode all data before splitting"""
    # Handle numeric features first
    for col in numeric_features:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Convert actual to numeric for KNN imputer
    df['actual'] = df['actual'].map({'Yes': 1, 'No': 0, "Prefer not to say / I don't know": 0, 1: 1, 0: 0})
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
            'cost_of_study', 'actual'
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
            df['actual'] = df['actual'].map({'Yes': 1, 'No': 0, "Prefer not to say / I don't know": 0, 1: 1, 0: 0})
            df['actual'] = pd.to_numeric(df['actual'], errors='coerce')
            print("Processed 'actual' column successfully.")

        # Exclude specific columns
        exclude_columns = ['mental_health_activities', 'timetable_reasons', 'source', 'captured_at']
        df = df.drop(columns=[col for col in exclude_columns if col in df.columns])
        print("Excluded specific columns successfully.")

        # Preprocess entire dataset
        df, encoders = clean_and_encode_data(df, selected_numeric_features, selected_categorical_features)
        print("Preprocessed dataset successfully.")
        
        df.to_excel('encoded_cleaned_data.xlsx', index=False)
        print("Saved encoded and cleaned data to 'encoded_cleaned_data.xlsx'.")
        
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
        print("Scaled features successfully.")
        
        # Apply SMOTE only to training data
        smote = SMOTE(random_state=42)
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
        print("Applied SMOTE to training data successfully.")
        print(f"Original training data size: {len(X_train)}, Resampled training data size: {len(X_train_resampled)}")
        
        

        # Train and evaluate models
        models = ['RandomForest', 'NeuralNetwork']
        # Initialize predictions array
        predictions = np.zeros((len(undiagnosed), len(models)))
        for model_type in models:
            print(f"\nTraining and evaluating {model_type} model...")
            train_and_save_model(X_train_resampled, y_train_resampled, model_type=model_type)
            
            # Load the trained model
            model_filename = f'{model_type}_model.sav'
            if os.path.exists(model_filename):
                model = joblib.load(model_filename)
                print(f"Loaded model from {model_filename}")
            else:
                raise FileNotFoundError(f"Model file {model_filename} not found. Please train the model first.")
            
            # Cross-validation scores
            cv_scores = cross_val_score(model, X_train_resampled, y_train_resampled, cv=5)
            print(f"Cross-validation accuracy for {model_type}: {cv_scores.mean():.2f} (+/- {cv_scores.std() * 2:.2f})")
            
            # Train model
            model.fit(X_train_resampled, y_train_resampled)
            print(f"Trained {model_type} model successfully.")
            
            # Predictions on test set
            test_pred = model.predict(X_test)
            
            # Calculate metrics
            print(f"\nTest Set Metrics for {model_type}:")
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
            print(f"\nTraining Set Metrics for {model_type}:")
            print(f"Accuracy: {accuracy_score(y_train_resampled, train_pred):.2f}")
            print(f"Precision: {precision_score(y_train_resampled, train_pred):.2f}")
            print(f"Recall: {recall_score(y_train_resampled, train_pred):.2f}")
            print(f"F1 Score: {f1_score(y_train_resampled, train_pred):.2f}")
            print("\nConfusion Matrix:")
            print(confusion_matrix(y_train_resampled, train_pred))
            print("\nClassification Report:")
            print(classification_report(y_train_resampled, train_pred))
            
            # Plot and save metrics charts
            y_test_proba = model.predict_proba(X_test)[:, 1]
            plot_model_metrics(y_test, y_test_proba, model_type)
            
            # Predict undiagnosed cases
            X_undiagnosed = undiagnosed[selected_numeric_features + selected_categorical_features]
            predictions[:, 0] = model.predict(X_undiagnosed)
            predicted_positive = sum(predictions[:, 0] == 1)
            print(f"\nPredictions for Undiagnosed Cases with {model_type}:")
            print(f"Predicted positive cases: {predicted_positive} ({predicted_positive/len(undiagnosed)*100:.2f}%)")
            
            # Ensemble predictions for undiagnosed cases
            final_predictions = np.where(predictions.mean(axis=1) >= 0.5, 1, 0)
            
            # Combine results
            undiagnosed['predictions'] = final_predictions
            diagnosed['predictions'] = 1  # All diagnosed cases remain positive
            
            result_df = pd.concat([diagnosed, undiagnosed])
            
            print(f"\nFinal Results for {model_type}:")
            print(f"Original diagnosed cases: {len(diagnosed)}")
            print(f"Newly identified potential cases: {sum(final_predictions == 1)}")
            print(f"Total identified cases: {len(diagnosed) + sum(final_predictions == 1)}")
        
        return result_df

    except Exception as e:
        print(f"Error in model evaluation: {str(e)}")
        raise