import './App.css';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import CompanyTickers from "./company_tickers.json";
import CompanyPrices from "./company_tickers_prices.json";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Comparing Percents for Predicted vs Real Stock Price Change',
    },
  },
  // maintainAspectRatio: 
};

const labels = ['Dataset'];

const tickers = Array(11643).fill().map((_, index) => CompanyTickers[index].ticker);

function App() {
  const [isGraphRendered, setIsGraphRendered] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [text, setText] = useState(null);
  const [ticker, setTicker] = useState(null);
  const [modelType, setModelType] = useState("Linear Regression");
  const [year, setYear] = useState("2021");
  const [chartData, setChartData] = useState(null);
  const handleChange = (event) => {
    setModelType(event.target.value);
  };

  const findTickerPriceChange = (ticker, year) => {
    for (let i = 0; i < 11643; i++) {
      const data = CompanyPrices[i];
      if (data.ticker === ticker) {
        return data.stock[year];
      }
    }
    throw new Error("unable to find ticker!");
  }

  const handleInference = async () => {
    setIsGraphRendered(false);
    setIsLoadingData(true);
    console.log(modelType);
    console.log(text);
    console.log(ticker);
    const res = await fetch('/api/inference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, modelType })
    })
    const val = await res.json();
    setChartData({
      labels,
      datasets: [
        {
          label: 'Predicted',
          data: [Number(val.data[0]) * 100],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Actual',
          data: [Number(findTickerPriceChange(ticker, year)) * 100],
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    });
    setIsGraphRendered(true);
    setIsLoadingData(false);
  }

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Predicting Stock Trends via SEC 10-K Filings
            </Typography>
            <Typography component="div" style={{ textAlign: "right" }}>
              by Peter Wu, Ashley Young, and Kevin Zhou
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <br />
      <Container maxWidth="xl">
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Card variant="outlined" style={{ minHeight: "75vh" }}><>
              <CardContent>
                <Typography variant="h5" component="div">
                  Inference
                </Typography>
                <br />
                <Autocomplete
                  disablePortal
                  id="combo-box-demo"
                  options={tickers}
                  onChange={(_, values) => setTicker(values)}
                  sx={{ width: 300 }}
                  renderInput={(params) => <TextField {...params} label="Ticker" />}
                />
                <br />
                <TextField
                  placeholder="Enter 10-K filing M&A (Item 7) text here."
                  multiline
                  onChange={(event) => setText(event.target.value)}
                  style={{ width: "100%" }}
                  rows={9}
                />
                <br />
                <InputLabel id="demo-simple-select-label">Model to use</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={modelType}
                  label="Model Type"
                  defaultValue={"Linear Regression"}
                  onChange={handleChange}
                >
                  <MenuItem value={"Linear Regression"}>Linear Regression</MenuItem>
                  <MenuItem value={"Random Forest"}>Random Forest</MenuItem>
                  <MenuItem value={"XGBoost"}>XGBoost</MenuItem>
                  <MenuItem value={"Light Gradient Boosting Machine"}>Light Gradient Boosting Machine</MenuItem>
                </Select>
                <br />
                <InputLabel id="year-label">Year of filing</InputLabel>
                <Select
                  labelId="year-label"
                  id="year-simple-select"
                  value={year}
                  label="Year of filing"
                  defaultValue={"2017"}
                  onChange={(event) => setYear(event.target.value)}
                >
                  <MenuItem value={"2017"}>2017</MenuItem>
                  <MenuItem value={"2018"}>2018</MenuItem>
                  <MenuItem value={"2019"}>2019</MenuItem>
                  <MenuItem value={"2020"}>2020</MenuItem>
                  <MenuItem value={"2021"}>2021</MenuItem>
                </Select>
              </CardContent>
              <CardActions>
                <Button variant="outlined" onClick={() => handleInference()}>Perform Inference</Button>
              </CardActions>
            </></Card>
          </Grid>
          <Grid item xs={6}>
            <Card variant="outlined" style={{
              minHeight: "75vh",
              display: "flex",
              alignItems: (isGraphRendered || isLoadingData) ? "center" : undefined,
              justifyContent: (isGraphRendered || isLoadingData) ? "center" : undefined
            }}>{
                isLoadingData ?
                  <CircularProgress size={60} className="progress" />
                  : <>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        Results
                      </Typography>
                      <br />
                      {isGraphRendered ? <Bar options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: true,
                            text: 'Comparing Percents for Predicted vs Real Stock Price Change in '
                              + year + ' for ' + ticker,
                          },
                        },
                      }}
                        data={chartData} width={"500px"} height={"500px"} /> :
                        <>
                          <Typography variant="h6" color="grey">
                            No inference has been conducted yet!
                            Please enter your data and click 'Perform Inference' to begin.
                          </Typography>
                          <br />
                          <Typography color="grey">
                            How it works: this will set off the same pipeline as in the
                            Jupyter Notebook, where we conduct NLP methods to do feature engineering,
                            and then do predictions with your selected model.
                          </Typography>
                        </>}
                      <CardActions>
                      </CardActions>
                    </CardContent>
                  </>
              }</Card>
          </Grid>
        </Grid>
      </Container>

    </>
  );
}

export default App;
