const getCountryDetails = async (countryCode) => {
  const response = await fetch(`https://api.countrystatecity.in/v1/countries/${countryCode}`, {
    headers: { 'X-CSCAPI-KEY': 'YOUR_API_KEY' }
  });

  if (response.ok) {
    const country = await response.json();
    console.log(country);
    return country;
  } else {
    console.error('Country not found');
  }
};

const response = await fetch('https://api.countrystatecity.in/v1/countries', {
  headers: { 'X-CSCAPI-KEY': 'YOUR_API_KEY' }
});

const countries = await response.json();
console.log(countries);
