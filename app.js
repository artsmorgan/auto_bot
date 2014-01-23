var express = require('express');
var curl = require('curlrequest');
var app = express();
var http = require('http');
var cheerio = require('cheerio');
var iaai = require('./iaai');

var domain = 'http://ww2.copart.com/us/';
var iaaiDomain = 'https://www.iaai.com/';
/*var options = {
  host: 'ww2.copart.com',
  port: 80,
  path: '
  /us/search?companyCode_vf=US&LotTypes=V&YearFrom=2003&YearTo=2014&Make=BMW+&ModelGroups=X5&RadioGroup=Location
  &YardNumber=&States=&PostalCode=&Distance=0&searchTitle=BMW++++++++++++++++++++++++%2CX5%2C&cn=BMW++++++++++++++++++++++++%2CX5%2C'

 http://ww2.copart.com/us/search?q=&Page=1&LotTypes=V&RadioGroup=Location&PostalCode=&Distance=0&YearFrom=2003&YearTo=2014&States=&'
 SearchTitle=HYUNDAI++++++++++++++++++++%2CSANTA+FE%2C&YardNumber=&
 zipFilter=0&cn=HYUNDAI++++++++++++++++++++%2CSANTA+FE%2C&vf_titlgroup=&PageSize=20&Make=HYUN&ModelGroups=SANTA+FE&Sort=mi
};*/

/****** HELPERS *****/
function parseData(string){
    var pos, newString;
    newString = string.split(':');
    pos = newString[1];
    return pos;
}
function parseUrl(string){
    var pos, newString;
    newString = string.replace('//','/');
    return 'http://' + newString;
}

function parseHtml(html){
    var newString = html.replace('<', '&lt;');
    return newString;
}



//free search
app.get('/busqueda/:search/:page', function(req, res){
    var str = req.params.search;
    var page = req.params.page;
    var replaced = str.split(' ').join('+');
    console.log(replaced);

    var _url = domain +'search?q=' + replaced + '&page='+page;
    var options = { url: _url, include: true };
    var _data = '';



    curl.request(options, function (err, data) {
        _data += data;
        //Start Paring the data
        $ = cheerio.load(_data);

        var dataArray = [];
        var listItem = {};
        var pagingObj ={};
        var _count = 0;

        var listImageUrl, listTitle, listLot, CarTitle,
            listRetailValue, listRepairEst, listTitle, listMiles,
            listDamage, listSaleDate, listLocation, paging, txt, parseTxt;

        var searchResults = $('.search-results').html();
        $('.results  > tr').each(function() {

            CarTitle = $(this).find('.lot-desc').text();//
            listImageUrl = $(this).find('.lot-detail-image').attr('src');
            listLot = $(this).find('.results-first-col li').first().text();
            listRetailValue = $(this).find('.results-first-col li:nth-child(2)').text();
            listRepairEst = $(this).find('.results-first-col li:nth-child(3)').text();
            listTitle = $(this).find('.results-first-col li:nth-child(4)').text();
            listMiles = $(this).find('.results-second-col li').first().text();
            listDamage = $(this).find('.results-second-col li:nth-child(3)').text();
            listSaleDate = $(this).find('.results-last-col .converted-time').text();
            listLocation = $(this).find('.results-last-col .location-block').text();

            listLot = parseData(listLot);
            if(typeof(listLot) !== undefined || listLot != null ||listLot != '' ){
                listLot = listLot.replace(/[^\d.]/g, "");
                console.log(listLot);
            }


            listItem = {
                "CarTitle" : CarTitle,
                "image" : parseUrl(listImageUrl),
                "lotID" :listLot,
                "retailValue": parseData(listRetailValue),
                "Repair": parseData(listRepairEst),
                "title": parseData(listTitle),
                "miles" : listMiles,
                "damage": listDamage,
                "saleDate": listSaleDate,
                "location" : listLocation
            }

            dataArray.push(listItem);

        });

        res.jsonp(dataArray); //JSON.stringify(dataArr)
    });

});

app.get('/searchPagination/:search/:page', function(req, res){
    var str = req.params.search;
    var page = req.params.page;

    if(page == null || page == 'undefined' || page == '' )
        page = 1;

    var replaced = str.split(' ').join('+');
    console.log(page);

    var _url = domain +'search?q=' + replaced+'&Page='+ page;
    var options = { url: _url, include: true };
    var _data = '';



    curl.request(options, function (err, data) {
        _data += data;
        //Start Paring the data
        $ = cheerio.load(_data);

        var dataArray = [];
        var listItem = {};
        var pagingObj ={};
        var _count = 0;



        //set paging
        var _href, _parsedHref;
        $('.paging > li > a').each(function(){
            if(!isNaN($(this).text()) ){
                $(this).attr('href','/busqueda/'+req.params.search+'/'+$(this).text());
            }else{
                _href =  $(this).attr('href');
                _parsedHref = _href.split('Page=');
                $(this).attr('href','/busqueda/'+req.params.search+'/'+_parsedHref[1]);
            }
        });
        $( ".paging > li" ).last().remove();

        paging = $('.paging').html();

        pagingObj = {
            "paging" : paging
        }
        /*dataArray.push(pagingObj);*/

        res.jsonp(pagingObj); //JSON.stringify(dataArr)
    });

});

//Get Images
app.get('/lote/:lot/images', function(req, res){
    var str = req.params.lot;
    var replaced = str.split(' ').join('+');
    var _url =  domain +'Lot/' + str + '/Photos';
    var options = { url: _url, include: true };
    var _data = '';

    var imagesAr = [];
    var _img;

    console.log(_url);

    curl.request(options, function (err, data) {
        _data += data;
        //Start Paring the data
        $ = cheerio.load(_data);

        var dataArray = [];
        $('.list-photos li').each(function(index){
            _img = $(this).find('img').attr('src');
            imagesAr.push(_img);
        });

        imagesAr.pop();

        res.jsonp(imagesAr); //JSON.stringify(dataArr)
    });

});


//Get Car details
app.get('/lote/:lot', function(req, res){
    var str = req.params.lot;

    var _url = domain +'Lot/' + str;
    var options = { url: _url, include: true };
    var _data = '';

    console.log(_url);


    curl.request(options, function (err, data) {
        _data += data;
        //Start Paring the data
        $ = cheerio.load(_data);
        var _objTitle, _carTitle;
        var _odometer = '';
        var _Highlights = '';
        var _PrimaryDamage = '';
        var _SecondaryDamage = '';
        var _EstRetailValue = '';
        var _VIN = '';
        var _BodyStyle = '';
        var _Drive = '';
        var _EngineType = '';
        var _Color = '';
        var _Cylinder = '';
        var _Fuel = '';
        var _Location = '';
        var _SaleDate = '';
        var _driveStr = '';
        var dataArray = [];
        var listItem = {};
        var dataObj ={};
        var _count = 0;
        var saleDateStr = false;


        //console.log(data);
        $('.row').each(function(index){

            if($(this).find('.label').text()=='Odometer'){
                _odometer = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='Highlights'){
                _Highlights = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='Primary Damage'){
                _PrimaryDamage = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='Secondary Damage'){
                _SecondaryDamage = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='Est. Retail Value'){
                _EstRetailValue = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='VIN'){
                _VIN = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='Body Style'){
                _BodyStyle = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='Drive'){

                _driveStr = $(this).find('.lot-content').text();
                _driveStr = _driveStr.replace(/\s/g, "");


                if(_driveStr == 'FRONT-WHEELDRIVE'){
                    _Drive = '4x2';
                }else if(_driveStr == 'FOURBYFOUR'){
                    _Drive = '4x4';
                }else if(_driveStr == 'REAR-WHEELDRIVE'){
                    _Drive = '4x2';
                }else if(_driveStr == 'ALLWHEELDRIBE'){
                    _Drive = '4x4';
                }

            }else if($(this).find('.label').text()=='Engine Type'){
                _EngineType = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='Color'){
                _Color = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='Cylinder'){
                _Cylinder = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='Fuel'){
                _Fuel = $(this).find('.lot-content').text();
            }else if($(this).find('.label').text()=='Location'){
                _Location = $(this).find('.lot-content').text();
                console.log(_Location);
            }else if( $(this).find('.label').text().indexOf("Sale Date") > 0){
                _SaleDate = $(this).find('.converted-time').attr('data-original-time');
            }
        });


        dataObj = {
            'objTitle' : $('#TitleHead').find('h2').text(),
            'carTitle' : $('.lot-content').contents(":not(:empty)").first().text(),
            'odometer' : _odometer,
            'highlight': _Highlights,
            'PrimaryDamage' : _PrimaryDamage,
            'SecondaryDamage' : _SecondaryDamage,
            'EstRetailValue' : _EstRetailValue,
            'BodyStyle' : _BodyStyle,
            'Drive' : _Drive,
            'EngineType' : _EngineType,
            'Color' : _Color,
            'Cylinder' : _Cylinder,
            'Fuel' : _Fuel,
            'Location' : _Location,
            'SaleDate' : _SaleDate,
            'Vin' : _VIN

        }

        /*dataArray.push(pagingObj);*/

        res.jsonp(dataObj); //JSON.stringify(dataArr)
    });

});

//Get Detail Parameters

app.get('/getCarList/:make/:model/:yearFrom/:yearTo/:page', function(req, res){
    var _yearFrom, _yearTo;

    (!req.params.yearFrom)? _yearFrom = 1965 : _yearFrom = req.params.yearFrom;
    (!req.params.yearTo)? _yearTo = date.getFullYear() : _yearTo = req.params.yearTo;

    var _url = domain +'search?companyCode_vf=US&LotTypes=V&YearFrom='+_yearFrom+'&YearTo='+_yearTo+'&Make='+req.params.make+
                '&ModelGroups='+req.params.model+'&RadioGroup=Location&YardNumber=&States=&PostalCode=&Distance=0&' +
                'searchTitle=---++++++++++++++++++++++++%2CX5%2C&cn=---++++++++++++++++++++++++%2C---%2C&Page='+ req.params.page;
    var options = { url: _url, include: true };
    var _data = '';

    console.log(_url);

    curl.request(options, function (err, data) {

        _data += data;
        //Start Paring the data

        $ = cheerio.load(_data);

        var dataArray = [];
        var listItem = {};
        var pagingObj ={};
        var _count = 0;

        var listImageUrl, listTitle, listLot, CarTitle,
            listRetailValue, listRepairEst, listTitle, listMiles,
            listDamage, listSaleDate, listLocation, paging, txt, parseTxt;

        var searchResults = $('.search-results').html();
        $('.results  > tr').each(function() {

            CarTitle = $(this).find('.lot-desc').text();//
            listImageUrl = $(this).find('.lot-detail-image').attr('src');
            listLot = $(this).find('.results-first-col li').first().text();
            listRetailValue = $(this).find('.results-first-col li:nth-child(2)').text();
            listRepairEst = $(this).find('.results-first-col li:nth-child(3)').text();
            listTitle = $(this).find('.results-first-col li:nth-child(4)').text();
            listMiles = $(this).find('.results-second-col li').first().text();
            listDamage = $(this).find('.results-second-col li:nth-child(3)').text();
            listSaleDate = $(this).find('.results-last-col .converted-time').text();
            listLocation = $(this).find('.results-last-col .location-block').text();

            listLot = parseData(listLot);
            listLot = listLot.replace(/[^\d.]/g, "");

            listItem = {
                "CarTitle" : CarTitle,
                "image" : parseUrl(listImageUrl),
                "lotID" :listLot,
                "retailValue": parseData(listRetailValue),
                "Repair": parseData(listRepairEst),
                "title": parseData(listTitle),
                "miles" : listMiles,
                "damage": listDamage,
                "saleDate": listSaleDate,
                "location" : listLocation
            }

            dataArray.push(listItem);

        });

        res.jsonp(dataArray); //JSON.stringify(dataArr)

        });



});


app.get('/getCarListPagination/:make/:model/:yearFrom/:yearTo/:page', function(req, res){
    var _yearFrom, _yearTo;

    (!req.params.yearFrom)? _yearFrom = 1965 : _yearFrom = req.params.yearFrom;
    (!req.params.yearTo)? _yearTo = date.getFullYear() : _yearTo = req.params.yearTo;
    var page = req.params.page;

    if(page == null || page == 'undefined' || page == '' )
        page = 1;



    var _url = domain +'search?companyCode_vf=US&LotTypes=V&YearFrom='+_yearFrom+'&YearTo='+_yearTo+'&Make='+req.params.make+
        '&ModelGroups='+req.params.model+'&RadioGroup=Location&YardNumber=&States=&PostalCode=&Distance=0&' +
        'searchTitle=---++++++++++++++++++++++++%2CX5%2C&cn=---++++++++++++++++++++++++%2C---%2C&Page='+ req.params.page;
    var options = { url: _url, include: true };
    var _data = '';



    curl.request(options, function (err, data) {
        _data += data;
        //Start Paring the data
        $ = cheerio.load(_data);

        var dataArray = [];
        var listItem = {};
        var pagingObj ={};
        var _count = 0;



        //set paging
        var _href, _parsedHref;
        $('.paging > li > a').each(function(){
            if(!isNaN($(this).text()) ){
                $(this).attr('href','/busquedas/'+req.params.make+'/'+req.params.model+'/'+_yearFrom+'/'+_yearTo+'/'+$(this).text());
            }else{
                _href =  $(this).attr('href');
                _parsedHref = _href.split('Page=');
                $(this).attr('href','/busquedas/'+req.params.make+'/'+req.params.model+'/'+_yearFrom+'/'+_yearTo+'/'+_parsedHref[1]);
            }
        });
        $( ".paging > li" ).last().remove();

        paging = $('.paging').html();

        pagingObj = {
            "paging" : paging
        }
        /*dataArray.push(pagingObj);*/

        res.jsonp(pagingObj); //JSON.stringify(dataArr)
    });

});



//Get MotorCicles

app.get('/getMotorcicleList/:page', function(req, res){


    var _url = domain + 'search?companyCode_vf=US&LotTypes=C&YearFrom=2003&YearTo=2014&Make=&RadioGroup=Location&YardNumber=&States=&PostalCode=&Distance=0&searchTitle=&cn=&Page='+req.params.page;
    var options = { url: _url, include: true };
    var _data = '';



    curl.request(options, function (err, data) {

        _data += data;
        //Start Paring the data

        $ = cheerio.load(_data);

        var dataArray = [];
        var listItem = {};
        var pagingObj ={};
        var _count = 0;

        var listImageUrl, listTitle, listLot, CarTitle,
            listRetailValue, listRepairEst, listTitle, listMiles,
            listDamage, listSaleDate, listLocation, paging, txt, parseTxt;

        var searchResults = $('.search-results').html();
        $('.results  > tr').each(function() {

            CarTitle = $(this).find('.lot-desc').text();//
            listImageUrl = $(this).find('.lot-detail-image').attr('src');
            listLot = $(this).find('.results-first-col li').first().text();
            listRetailValue = $(this).find('.results-first-col li:nth-child(2)').text();
            listRepairEst = $(this).find('.results-first-col li:nth-child(3)').text();
            listTitle = $(this).find('.results-first-col li:nth-child(4)').text();
            listMiles = $(this).find('.results-second-col li').first().text();
            listDamage = $(this).find('.results-second-col li:nth-child(3)').text();
            listSaleDate = $(this).find('.results-last-col .converted-time').text();
            listLocation = $(this).find('.results-last-col .location-block').text();

            listLot = parseData(listLot);
            listLot = listLot.replace(/[^\d.]/g, "");

            listItem = {
                "CarTitle" : CarTitle,
                "image" : parseUrl(listImageUrl),
                "lotID" :listLot,
                "retailValue": parseData(listRetailValue),
                "Repair": parseData(listRepairEst),
                "title": parseData(listTitle),
                "miles" : listMiles,
                "damage": listDamage,
                "saleDate": listSaleDate,
                "location" : listLocation
            }

            dataArray.push(listItem);

        });

        res.jsonp(dataArray); //JSON.stringify(dataArr)

    });


});
app.get('/getMotorcicleListPagination/:page', function(req, res){
    var _url = domain + 'search?companyCode_vf=US&LotTypes=C&YearFrom=2003&YearTo=2014&Make=&RadioGroup=Location&YardNumber=&States=&PostalCode=&Distance=0&searchTitle=&cn=&Page='+req.params.page;
    var options = { url: _url, include: true };
    var _data = '';



    curl.request(options, function (err, data) {
        _data += data;
        //Start Paring the data
        $ = cheerio.load(_data);

        var dataArray = [];
        var listItem = {};
        var pagingObj ={};
        var _count = 0;



        //set paging
        var _href, _parsedHref;
        $('.paging > li > a').each(function(){
            if(!isNaN($(this).text()) ){
                $(this).attr('href','/motos/'+$(this).text());
            }else{
                _href =  $(this).attr('href');
                _parsedHref = _href.split('Page=');
                $(this).attr('href','/motos/'+_parsedHref[1]);
            }
        });
        $( ".paging > li" ).last().remove();

        paging = $('.paging').html();

        pagingObj = {
            "paging" : paging
        }
        /*dataArray.push(pagingObj);*/

        res.jsonp(pagingObj); //JSON.stringify(dataArr)
    });

});



/***********     IAAI Functions   **************/
    app.get('/iaai/index', function(req, res){

        var _url = 'https://www.iaai.com/Vehicles/Search.aspx?Keyword=hyndai+santa+fe+2004';
//        var _url = iaaiDomain;
        var options = { url: _url, include: true };
        var _data = '';



        curl.request(options, function (err, data) {
            _data += data;
            //Start Paring the data
            $ = cheerio.load(_data);

            var dataArray = [];
            var listItem = {};
            var pagingObj ={};
            var _count = 0;

            console.log(_data);

        });

    });






app.listen(process.env.PORT || 5000)
//console.log('Listening on port 5000');