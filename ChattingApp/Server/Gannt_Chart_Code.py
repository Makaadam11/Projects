import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta

# Define the tasks, start dates, durations, and dependencies
tasks = [
    {"Task": "Curriculum Developed", "Start": "2025-01-01", "Duration": 30, "Dependency": None},
    {"Task": "Trainer & Partner Engagement Complete", "Start": "2025-01-15", "Duration": 30, "Dependency": "Curriculum Developed"},
    {"Task": "Training Delivery Begins", "Start": "2025-02-01", "Duration": 60, "Dependency": "Trainer & Partner Engagement Complete"},
    {"Task": "Hackathon Preparation & Promotion", "Start": "2025-03-01", "Duration": 30, "Dependency": "Trainer & Partner Engagement Complete"},
    {"Task": "Cyber Hackathons Executed", "Start": "2025-04-01", "Duration": 15, "Dependency": "Hackathon Preparation & Promotion"},
    {"Task": "Kits Distributed to Learners", "Start": "2025-03-01", "Duration": 15, "Dependency": "Training Delivery Begins"},
    {"Task": "Extended Resources Published", "Start": "2025-04-15", "Duration": 15, "Dependency": "Cyber Hackathons Executed"},
    {"Task": "Final Report and Dissemination", "Start": "2025-05-01", "Duration": 15, "Dependency": "Extended Resources Published"},
]

# Create a DataFrame
df = pd.DataFrame(tasks)
df["Start"] = pd.to_datetime(df["Start"])
df["End"] = df["Start"] + pd.to_timedelta(df["Duration"], unit='d')

# Plotting
fig, ax = plt.subplots(figsize=(12, 6))

# Plot bars
for i, row in df.iterrows():
    ax.barh(row["Task"], row["Duration"], left=row["Start"], color="skyblue")
    if row["Dependency"]:
        dep_index = df[df["Task"] == row["Dependency"]].index[0]
        dep_end = df.loc[dep_index, "End"]
        ax.annotate("",
                    xy=(row["Start"], i),
                    xytext=(dep_end, dep_index),
                    arrowprops=dict(arrowstyle="->", color='gray'))

# Formatting
ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
ax.xaxis.set_major_formatter(mdates.DateFormatter("%b %d"))
plt.xticks(rotation=45)
ax.set_title("Gantt Chart: CCI-Cybersecurity Innovation Hub")
ax.invert_yaxis()
plt.tight_layout()
plt.grid(True)

plt.show()
