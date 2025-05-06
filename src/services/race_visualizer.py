from fastapi import FastAPI, Query
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import matplotlib.pyplot as plt
import fastf1
import fastf1.plotting
import io
import base64
import seaborn as sns
import pandas as pd
from timple.timedelta import strftimedelta
from fastf1.core import Laps

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/generate-plot")
async def generate_plot(
    year: int = Query(2023, ge=2023, le=2025),
    race: int = Query(1, ge=1, le=24)
):
    try:
        # Load FastF1's dark color scheme
        fastf1.plotting.setup_mpl(mpl_timedelta_support=False, misc_mpl_mods=False,
                                color_scheme='fastf1')
        
        # Get the session data
        session = fastf1.get_session(year, race, 'R')
        session.load(telemetry=False, weather=False)

        # Create the plot
        fig, ax = plt.subplots(figsize=(8.0, 4.9))

        for drv in session.drivers:
            drv_laps = session.laps.pick_drivers(drv)

            abb = drv_laps['Driver'].iloc[0]
            style = fastf1.plotting.get_driver_style(identifier=abb,
                                                    style=['color', 'linestyle'],
                                                    session=session)

            ax.plot(drv_laps['LapNumber'], drv_laps['Position'],
                    label=abb, **style)

        ax.set_ylim([20.5, 0.5])
        ax.set_yticks([1, 5, 10, 15, 20])
        ax.set_xlabel('Lap')
        ax.set_ylabel('Position')
        ax.set_title(f'{year} Race {race} - Driver Positions')

        ax.legend(bbox_to_anchor=(1.0, 1.02))
        plt.tight_layout()

        # Save the plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close()

        # Convert to base64
        img_str = base64.b64encode(buf.getvalue()).decode()
        return {"image": img_str}
    except Exception as e:
        print(f"Error generating plot: {str(e)}")
        return {"error": str(e)}

@app.get("/generate-lap-times")
async def generate_lap_times(
    year: int = Query(2023, ge=2023, le=2025),
    race: int = Query(1, ge=1, le=24),
    driver: str = Query(..., description="Driver's three-letter code (e.g., HAM, VER)")
):
    try:
        # Enable Matplotlib patches for plotting timedelta values and load FastF1's dark color scheme
        fastf1.plotting.setup_mpl(mpl_timedelta_support=True, misc_mpl_mods=False,
                                color_scheme='fastf1')
        
        # Get the session data
        session = fastf1.get_session(year, race, 'R')
        session.load()

        # Get driver's laps
        driver_laps = session.laps.pick_drivers(driver).pick_quicklaps().reset_index()
        
        # Create the plot
        fig, ax = plt.subplots(figsize=(8, 8))

        sns.scatterplot(data=driver_laps,
                    x="LapNumber",
                    y="LapTime",
                    ax=ax,
                    hue="Compound",
                    palette=fastf1.plotting.get_compound_mapping(session=session),
                    s=80,
                    linewidth=0,
                    legend='auto')

        ax.set_xlabel("Lap Number")
        ax.set_ylabel("Lap Time")
        ax.invert_yaxis()
        
        # Get driver's full name
        driver_info = session.get_driver(driver)
        driver_name = f"{driver_info.FirstName} {driver_info.LastName}"
        
        # Get race name
        race_name = session.event.EventName
        
        plt.suptitle(f"{driver_name} Laptimes in the {year} {race_name}")

        # Turn on major grid lines
        plt.grid(color='w', which='major', axis='both')
        sns.despine(left=True, bottom=True)

        plt.tight_layout()

        # Save the plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close()

        # Convert to base64
        img_str = base64.b64encode(buf.getvalue()).decode()
        return {"image": img_str}
    except Exception as e:
        print(f"Error generating lap times plot: {str(e)}")
        return {"error": str(e)}

@app.get("/generate-team-pace")
async def generate_team_pace(
    year: int = Query(2023, ge=2023, le=2025),
    race: int = Query(1, ge=1, le=24)
):
    try:
        # Load FastF1's dark color scheme
        fastf1.plotting.setup_mpl(mpl_timedelta_support=False, misc_mpl_mods=False,
                                color_scheme='fastf1')
        
        # Get the session data
        session = fastf1.get_session(year, race, 'R')
        session.load()
        
        # Get quick laps
        laps = session.laps.pick_quicklaps()
        
        # Convert lap times to seconds
        transformed_laps = laps.copy()
        transformed_laps.loc[:, "LapTime (s)"] = laps["LapTime"].dt.total_seconds()
        
        # Order teams by median lap time
        team_order = (
            transformed_laps[["Team", "LapTime (s)"]]
            .groupby("Team")
            .median()["LapTime (s)"]
            .sort_values()
            .index
        )
        
        # Create team color palette
        team_palette = {team: fastf1.plotting.get_team_color(team, session=session)
                        for team in team_order}
        
        # Create the plot
        fig, ax = plt.subplots(figsize=(15, 10))
        sns.boxplot(
            data=transformed_laps,
            x="Team",
            y="LapTime (s)",
            hue="Team",
            order=team_order,
            palette=team_palette,
            whiskerprops=dict(color="white"),
            boxprops=dict(edgecolor="white"),
            medianprops=dict(color="grey"),
            capprops=dict(color="white"),
        )
        
        # Get race name
        race_name = session.event.EventName
        
        plt.title(f"{year} {race_name} - Team Pace Comparison")
        plt.grid(visible=False)
        
        # Remove redundant x-label
        ax.set(xlabel=None)
        plt.tight_layout()
        
        # Save the plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close()
        
        # Convert to base64
        img_str = base64.b64encode(buf.getvalue()).decode()
        return {"image": img_str}
    except Exception as e:
        print(f"Error generating team pace plot: {str(e)}")
        return {"error": str(e)}

@app.get("/generate-tire-strategy")
async def generate_tire_strategy(
    year: int = Query(2023, ge=2023, le=2025),
    race: int = Query(1, ge=1, le=24)
):
    try:
        # Load FastF1's dark color scheme
        fastf1.plotting.setup_mpl(mpl_timedelta_support=False, misc_mpl_mods=False,
                                color_scheme='fastf1')
        
        # Get the session data
        session = fastf1.get_session(year, race, 'R')
        session.load()
        
        # Get all laps
        laps = session.laps
        
        # Get the list of driver numbers and convert to abbreviations
        drivers = [session.get_driver(driver)["Abbreviation"] for driver in session.drivers]
        
        # Get stint information
        stints = laps[["Driver", "Stint", "Compound", "LapNumber"]]
        stints = stints.groupby(["Driver", "Stint", "Compound"])
        stints = stints.count().reset_index()
        stints = stints.rename(columns={"LapNumber": "StintLength"})
        
        # Create the plot
        fig, ax = plt.subplots(figsize=(5, 10))
        
        for driver in drivers:
            driver_stints = stints.loc[stints["Driver"] == driver]
            
            previous_stint_end = 0
            for idx, row in driver_stints.iterrows():
                compound_color = fastf1.plotting.get_compound_color(row["Compound"],
                                                                session=session)
                plt.barh(
                    y=driver,
                    width=row["StintLength"],
                    left=previous_stint_end,
                    color=compound_color,
                    edgecolor="black",
                    fill=True
                )
                
                previous_stint_end += row["StintLength"]
        
        # Get race name
        race_name = session.event.EventName
        
        plt.title(f"{year} {race_name} - Tire Strategies")
        plt.xlabel("Lap Number")
        plt.grid(False)
        ax.invert_yaxis()
        
        # Plot aesthetics
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_visible(False)
        
        plt.tight_layout()
        
        # Save the plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close()
        
        # Convert to base64
        img_str = base64.b64encode(buf.getvalue()).decode()
        return {"image": img_str}
    except Exception as e:
        print(f"Error generating tire strategy plot: {str(e)}")
        return {"error": str(e)}

@app.get("/generate-laptime-distribution")
async def generate_laptime_distribution(
    year: int = Query(2023, ge=2023, le=2025),
    race: int = Query(1, ge=1, le=24)
):
    try:
        # Enable Matplotlib patches for plotting timedelta values and load FastF1's dark color scheme
        fastf1.plotting.setup_mpl(mpl_timedelta_support=True, misc_mpl_mods=False,
                                color_scheme='fastf1')
        
        # Get the session data
        session = fastf1.get_session(year, race, 'R')
        session.load()
        
        # Get point finishers (top 10)
        point_finishers = session.drivers[:10]
        
        # Get quick laps for point finishers
        driver_laps = session.laps.pick_drivers(point_finishers).pick_quicklaps()
        driver_laps = driver_laps.reset_index()
        
        # Get finishing order
        finishing_order = [session.get_driver(i)["Abbreviation"] for i in point_finishers]
        
        # Convert lap times to seconds
        driver_laps["LapTime(s)"] = driver_laps["LapTime"].dt.total_seconds()
        
        # Create the plot
        fig, ax = plt.subplots(figsize=(10, 5))
        
        # Create violin plots
        sns.violinplot(data=driver_laps,
                    x="Driver",
                    y="LapTime(s)",
                    hue="Driver",
                    inner=None,
                    density_norm="area",
                    order=finishing_order,
                    palette=fastf1.plotting.get_driver_color_mapping(session=session)
                    )
        
        # Add swarm plot for individual lap times
        sns.swarmplot(data=driver_laps,
                    x="Driver",
                    y="LapTime(s)",
                    order=finishing_order,
                    hue="Compound",
                    palette=fastf1.plotting.get_compound_mapping(session=session),
                    hue_order=["SOFT", "MEDIUM", "HARD"],
                    linewidth=0,
                    size=4,
                    )
        
        # Get race name
        race_name = session.event.EventName
        
        plt.suptitle(f"{year} {race_name} - Lap Time Distributions")
        ax.set_xlabel("Driver")
        ax.set_ylabel("Lap Time (s)")
        sns.despine(left=True, bottom=True)
        
        plt.tight_layout()
        
        # Save the plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close()
        
        # Convert to base64
        img_str = base64.b64encode(buf.getvalue()).decode()
        return {"image": img_str}
    except Exception as e:
        print(f"Error generating laptime distribution plot: {str(e)}")
        return {"error": str(e)}

@app.get("/generate-qualifying")
async def generate_qualifying(
    year: int = Query(2023, ge=2023, le=2025),
    race: int = Query(1, ge=1, le=24)
):
    try:
        # Enable Matplotlib patches for plotting timedelta values
        fastf1.plotting.setup_mpl(mpl_timedelta_support=True, misc_mpl_mods=False,
                                color_scheme=None)
        
        # Get the session data
        session = fastf1.get_session(year, race, 'Q')
        session.load()
        
        # Get all drivers
        drivers = pd.unique(session.laps['Driver'])
        
        # Get fastest lap for each driver
        list_fastest_laps = list()
        for drv in drivers:
            drvs_fastest_lap = session.laps.pick_drivers(drv).pick_fastest()
            list_fastest_laps.append(drvs_fastest_lap)
        fastest_laps = Laps(list_fastest_laps) \
            .sort_values(by='LapTime') \
            .reset_index(drop=True)
        
        # Calculate time differences from pole
        pole_lap = fastest_laps.pick_fastest()
        fastest_laps['LapTimeDelta'] = fastest_laps['LapTime'] - pole_lap['LapTime']
        
        # Get team colors
        team_colors = list()
        for index, lap in fastest_laps.iterlaps():
            color = fastf1.plotting.get_team_color(lap['Team'], session=session)
            team_colors.append(color)
        
        # Create the plot
        fig, ax = plt.subplots(figsize=(10, 5))
        ax.barh(fastest_laps.index, fastest_laps['LapTimeDelta'],
                color=team_colors, edgecolor='grey')
        ax.set_yticks(fastest_laps.index)
        ax.set_yticklabels(fastest_laps['Driver'])
        
        # Show fastest at the top
        ax.invert_yaxis()
        
        # Draw vertical lines behind the bars
        ax.set_axisbelow(True)
        ax.xaxis.grid(True, which='major', linestyle='--', color='black', zorder=-1000)
        
        # Get race name and format pole lap time
        race_name = session.event.EventName
        lap_time_string = strftimedelta(pole_lap['LapTime'], '%m:%s.%ms')
        
        plt.suptitle(f"{race_name} {year} Qualifying\n"
                    f"Fastest Lap: {lap_time_string} ({pole_lap['Driver']})")
        
        plt.tight_layout()
        
        # Save the plot to a bytes buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        plt.close()
        
        # Convert to base64
        img_str = base64.b64encode(buf.getvalue()).decode()
        return {"image": img_str}
    except Exception as e:
        print(f"Error generating qualifying plot: {str(e)}")
        return {"error": str(e)} 