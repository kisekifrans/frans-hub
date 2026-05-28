# QA Outreach — sample CSV

Export **User Tables → Reviewers → Export CSV** from your dashboard, or use the sample file here:

- **File:** `qa-outreach-user-tables.csv`
- **URL (local dev):** http://localhost:3000/samples/qa-outreach-user-tables.csv

## Expected columns (User Tables export)

| Column       | Used for                          |
|-------------|-----------------------------------|
| Email       | Identity + bulk email filter      |
| Role        | Optional in templates (`{{role}}`) |
| Reviews     | Template rules (&lt;3, &gt;5, default) |
| Median Pace | Optional (`{{median_pace}}`)      |
| Hours       | Optional (`{{hours}}`)            |

Extra columns (Salvage, Review Score, Strikes, etc.) are kept in the file but ignored unless you map them later.

## Where to put your own CSV

You do **not** need to put files in this folder to use the tool. On **Admin → QA Audit → QA outreach**, click import and choose any `.csv` on your computer.

Optional: copy team reference exports into `frans-hub/public/samples/` so everyone can download the same example from `/samples/your-file.csv`.
