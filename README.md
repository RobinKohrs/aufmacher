# blattkritik-screenshots

## Project Overview
(A brief description of the project goals, methods, and expected outcomes.)

## Created On
2025-07-16 16:27:17 by data-project-creator

## Directory Structure
- `PROJECT_ROOT/` (/Users/rk/projects/dst/2025/2025-07-blattkritik-screenshots)
  - `data_raw/`: Raw, immutable input data.
    - `geodata/`: Raw geospatial data.
    - `tabular/`: Raw tabular data.
  - `data_output/`: Processed data, intermediate files, and final outputs derived from `data_raw/`.
  - `graphic_output/`: Charts, maps, and other visual outputs.
  - `scripts/`: General purpose scripts (e.g., Python, shell) not specific to R or QGIS workflows.
  - `docs/`: Project documentation, reports, notes, literature.
  - `R/`: R specific files.
    - `analysis/`: R Markdown/Quarto scripts for analysis, main R scripts.
    - `functions/`: Custom R functions.

  - `.gitignore`: Specifies intentionally untracked files that Git should ignore.
  - `blattkritik-screenshots.Rproj`: RStudio Project file. Open this to work with R in this project.



## Getting Started
1.  **Clone the repository (if applicable).**
2.  **Install dependencies:**
    - (Specify R packages, Python packages, system libraries, etc.)
    - (If using Python, consider a virtual environment: `python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`)
3.  **Data:**
    - Place raw data in `data_raw/`.
    - Scripts should read from `data_raw/` and write to `data_output/`.
4.  **R:** Open `blattkritik-screenshots.Rproj` in RStudio. Use the `here` package for path management (e.g., `here::here("data_raw", "my_file.csv")`).


## Key Contacts
- Robin Kohrs <robin.kohrs@gmx.de>
## Notes
(Any other important information or conventions for this project.)
