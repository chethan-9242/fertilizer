import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Read the dataset
df = pd.read_csv('data/Crop_recommendation.csv')

# Display the entire dataset
print("\n=== ENTIRE DATASET ===")
print(df)

# Display basic information
print("\n=== DATASET OVERVIEW ===")
print(f"Total number of records: {len(df)}")
print(f"Number of features: {len(df.columns)-1}")  # excluding label
print("\n=== CROP TYPES ===")
print(df['label'].value_counts())
print("\n=== FEATURE RANGES ===")
print(df.describe())

# Create visualizations
plt.figure(figsize=(15, 10))

# 1. Crop Distribution
plt.subplot(2, 2, 1)
sns.countplot(data=df, x='label')
plt.xticks(rotation=45)
plt.title('Distribution of Crop Types')

# 2. N-P-K Distribution
plt.subplot(2, 2, 2)
sns.boxplot(data=df[['N', 'P', 'K']])
plt.title('N-P-K Distribution')

# 3. Temperature and Humidity
plt.subplot(2, 2, 3)
sns.scatterplot(data=df, x='temperature', y='humidity', hue='label', alpha=0.6)
plt.title('Temperature vs Humidity by Crop')

# 4. pH and Rainfall
plt.subplot(2, 2, 4)
sns.scatterplot(data=df, x='ph', y='rainfall', hue='label', alpha=0.6)
plt.title('pH vs Rainfall by Crop')

plt.tight_layout()
plt.savefig('dataset_analysis.png')
plt.close()

print("\nVisualization saved as 'dataset_analysis.png'") 