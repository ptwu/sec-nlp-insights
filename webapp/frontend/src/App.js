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

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const card = (
  <>
    <CardContent style={{ height: "70vh" }}>

      <Typography variant="h5" component="div">
        Inference
      </Typography>
    </CardContent>
    <CardActions>
      <Button variant="outlined" onClick={() => alert("yay")}>Learn More</Button>
    </CardActions>
  </>
);


function App() {
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
            <Card variant="outlined">{card}</Card>
          </Grid>
          <Grid item xs={6}>
            <Item>xs=4</Item>
          </Grid>
        </Grid>
      </Container>

    </>
  );
}

export default App;
