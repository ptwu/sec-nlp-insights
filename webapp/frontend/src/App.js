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
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import CompanyTickers from "./company_tickers.json";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const labels = ['2016', '2017', '2018', '2019', '2020'];

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Comparing Results from Inference with Actual Data',
    },
  },
};

export const data = {
  labels,
  datasets: [
    {
      label: 'Actual data',
      data: labels.map(() => Math.random()),
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Predictions',
      data: labels.map(() => Math.random()),
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};

const tickers = Array(11643).fill().map((curr, index) => CompanyTickers[index].ticker);

function ComboBox() {
  return (
    <Autocomplete
      disablePortal
      id="combo-box-demo"
      options={tickers}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Ticker" />}
    />
  );
}

const card1 = (
  <>
    <CardContent>
      <Typography variant="h5" component="div">
        Inference
      </Typography>
      <br />
      <ComboBox />
      <br />
      <TextField
        placeholder="Enter 10-K filing M&A (Item 7) text here."
        multiline
        style={{ width: "100%" }}
        rows={15}
      />
    </CardContent>
    <CardActions>
      <Button variant="outlined" onClick={() => alert("yay")}>Perform Inference</Button>
    </CardActions>
  </>
);


const card2 = (
  <>
    <CardContent>
      <Typography variant="h5" component="div">
        Results
      </Typography>
      <br />
      <Line options={options} data={data} />
      <CardActions>
      </CardActions>
    </CardContent>
  </>
);


function App() {
  const [isGraphRendered, setIsGraphRendered] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
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
            <Card variant="outlined" style={{ minHeight: "75vh" }}>{card1}</Card>
          </Grid>
          <Grid item xs={6}>
            <Card variant="outlined" style={{ minHeight: "75vh" }}>{
              isLoadingData ?
                <CircularProgress />
                : card2
            }</Card>
          </Grid>
        </Grid>
      </Container>

    </>
  );
}

export default App;
