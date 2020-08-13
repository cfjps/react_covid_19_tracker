import React, {useState, useEffect} from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  CardContent,
  Card,
} from "@material-ui/core";
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { sortData, prettyPrintStat } from "./util"
import LineGraph from "./LineGraph"
import "leaflet/dist/leaflet.css"

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide')
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  // STATE = How to write a var in REACT

  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  }, []);

  //USEEFFECT = Runs a piece of code based on a given condition
  useEffect(() => {
    // The code inside here will run once when the component loads and not again
    // async --> send a request, waot for it, do something with the info
    const getCountriesData = async () => {
      await fetch ("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ));

        const sortedData = sortData(data);
        setTableData(sortedData)
        setMapCountries(data);
        setCountries(countries)
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    console.log("CountryCode: ", countryCode)
    setCountry(countryCode);

    const url = countryCode ==="worldwide" ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response => response.json())
    .then(data => {
      setCountry(countryCode);
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    });
  };

  console.log('COUNTRYINFO: ', countryInfo)
  document.title = "COVID-19 Tracker"
  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          {/* Header */}
          {/* Title + Select input dropdown field */}
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}
            >
                <MenuItem value="worldwide">Worldwide</MenuItem>
                {countries.map(country => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))}

              {/*<MenuItem value="worldwide">Worldwide</MenuItem>
              <MenuItem value="worldwide">Option 2</MenuItem>
              <MenuItem value="worldwide">Option 3</MenuItem>
              <MenuItem value="worldwide">Option 4</MenuItem>*/}

              </Select>
          </FormControl>
        </div>

        {/* InfoBoxes */}
        <div className="app__stats">
            <InfoBox title="Cornavirus Cases" isRed active={casesType === 'cases'} onClick={e => setCasesType('cases')} cases={prettyPrintStat(countryInfo.todayCases)} total={prettyPrintStat(countryInfo.cases)}/>

            <InfoBox title="Recovered" active={casesType === 'recovered'} onClick={e => setCasesType('recovered')} cases={prettyPrintStat(countryInfo.todayRecovered)} total={prettyPrintStat(countryInfo.recovered)}/>

            <InfoBox title="Deaths" isRed active={casesType === 'deaths'} onClick={e => setCasesType('deaths')} cases={prettyPrintStat(countryInfo.todayDeaths)} total={prettyPrintStat(countryInfo.deaths)}/>
        </div>

        {/* MAP */}
        <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom} />
      </div>

      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData} />
            {/* Table */}
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
            {/* Graph */}
          </CardContent>
      </Card>

    </div>
  );
}

export default App;
