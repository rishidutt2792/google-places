# google-places
An api to store data from google places api on location and user level
url - https://google-places-api.herokuapp.com/

# Requirnment 
    node js, objection js, postgresql

# Api 

1) API to signUp -

    Access - all  <br />
    request - POST <br />
    required body(**x-www-form-urleencode**) - userName,password <br />
    
        url - https://google-places-api.herokuapp.com/signUp
    
2) API to loginIN -
    
    Access - all <br />
    request - POST <br />
    required body(**x-www-form-urleencode**) - userName,password <br />
    
       url - https://google-places-api.herokuapp.com/login 
    Retrive token field from result and pass it as **x-access-token**  in header for further request
     
3) API to retrive geolocation of places based on any string -
   
    Access - all logged in users <br />
    header - x-access-token <br />
    request - GET <br />
    required url query - places="any string"  <br />
    
       url - https://google-places-api.herokuapp.com/location?places="ANY_STRING" 
       example -  https://google-places-api.herokuapp.com/location?places=hotels in mumbai 
    
    this api will return a response with matching criterial and geolocation of many places.Respond this to user.
    
    
4) API to store geolocation data of a places selected by user -

    Access - all logged in users <br />
    header - x-access-token <br />
    request - POST <br />
    required body(**x-www-form-urleencode**) -  <br />
    googleLocationId - id field (retrived from get location api) <br />
    placeId - placeId filed (retrived from get location api) <br />
    name(string) - name (retrived from get location api) <br />
    address(string) - formatted_address (retrived from get  location api) <br />
    latitude(float) - geometry.location.lat (retrived from get location api) <br />
    longitude(float) - geometry.location.lon (retrived from get location api) <br />
    locationType(text[]) - types (retrived from get location api)<br />
    
       url - https://google-places-api.herokuapp.com/location/create
    
    this api will create and save geolocation data of the place   
    
5) API to get google geolocation data for a paticular place based in placeId -
    Access - all logged in users
    header - x-access-token
    request - GET
    
       url params - placeId (retrived from get location api)
    
       url - https://google-places-api.herokuapp.com/location/placeId/details
    
    this api will get all  geolocation related data of the place       

# Admin Access apis
  
6) Search users for a paticular location 
 
    Access - admin <br /> 
    header - x-access-token <br />
    request - GET <br />
    url params - locationId  <br />
    
       url - https://google-places-api.herokuapp.com/location/id/users 
    
    this api retrives all users who searched for this paticular location  
    
7)  Route for most or least searched place can be filtered using date

    Access - admin  <br />
    header - x-access-token  <br />
    request - GET  <br />
    url query - query (can have  either value most or least) -- optional  <br />
    url query - date(YYYY-MM-DD format)  <br />
    
    with date  <br />
    
        url - https://google-places-api.herokuapp.com/location/search?date=2018-04-29&query=most
    
    without date  <br />
    
        url - https://google-places-api.herokuapp.com/location/search?query=most
        url - https://google-places-api.herokuapp.com/location/search?query=least

8) Api to filter location data and get users based on location type 

    Access - admin  <br />
    header - x-access-token  <br />
    request - GET  <br />
    url query - type (string) <br />
    
       url - https://google-places-api.herokuapp.com/location/type/user?type=value
       
    this api will filter and give all users who searched for a paticular type of location 
    

