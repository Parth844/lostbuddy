import pandas as pd
df = pd.read_csv("zipnet_final_clean_data.csv")
from pandas_profiling import ProfileReport
profile = ProfileReport(df, title="Missing Persons Data Analysis", explorative=True)
# To save the report to an HTML file
profile.to_file("missing_persons_data_analysis.html")
