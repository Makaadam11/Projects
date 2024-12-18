import pandas as pd

# Wczytaj plik Excel z dwoma wierszami nagłówka
df = pd.read_excel("C:/Projects/mentalhealth/data/UAL_1_Questionnaire_Data.xlsx", header=[0, 1])

# Wyświetl nazwy kolumn
print(df.columns)

# Wyświetl pierwsze dwa wiersze
print(df.head(2))