var express = require('express');
var curl = require('curlrequest');
var app = express();
var http = require('http');
var cheerio = require('cheerio');
var iaai = require('./iaai');

var domain = 'http://ww2.copart.com/us/';
var iaaiDomain = 'https://www.iaai.com/';

/****** HELPERS *****/
function parseData(string){
    var pos, newString;
    newString = string.split(':');
    pos = newString[1];
    return pos;
}
function parseUrl(string){
    var pos, newString;
    newString = string;//.replace('//','/');
    return 'http:' + newString;
}

function parseHtml(html){
    var newString = html.replace('<', '&lt;');
    return newString;
}

function removeBlank(str){
    var parse_str;
    parse_str = str.replace(/%20/g, "+");
    parse_str = str.replace(/ /g, "+");
    return parse_str;
}

//Filters
app.get('/filterList/:make/:model/:yearFrom/:yearTo/', function(req, res){

    var post_options, filter_by;

    if(req.params.make=="false"){
        post_options = 'http://ww2.copart.com/us/search?q='+req.params.model;
        filter_by = '';


    }else{
        post_options = 'getSearch=http://ww2.copart.com/us/search?companyCode_vf=US&amp;Sort=sd&amp;LotTypes=V&amp;YearFrom='+_yearFrom
            +'&amp;YearTo='+_yearTo
            +'&amp;Make='+req.params.make
            +'&amp;ModelGroups=&amp;RadioGroup=Location&amp;YardNumber=&amp;States=&amp;PostalCode=&amp;Distance=99999&amp;';
        filter_by = 'make';
    }

    var _yearFrom, _yearTo, model;
    (!req.params.yearFrom)? _yearFrom = 1965 : _yearFrom = req.params.yearFrom;
    (!req.params.yearTo)? _yearTo = date.getFullYear() : _yearTo = req.params.yearTo;
    if(req.params.model=='*'){
        model = '';
    }else{
        model = req.params.model;
    }
    //console.log('url filters: ');
    var _url = 'http://ww2.copart.com/us/search/GetSearchFilters';


    var options = {
        url: _url,
        include: true,
        method: "post",
        data:{
            getSearch: post_options,
            filter: filter_by
        }

    };
    var _data = '';

    curl.request(options, function (err, data) {
        _data += data;
        console.log(data);
        //Start Paring the data
        $ = cheerio.load(_data);
        var filter_holder = $('.filter-holder').html();
        var obj = {
            data : filter_holder
        }
        res.jsonp(obj); //JSON.stringify(dataArr)
    });

});


//free search
app.get('/busqueda/:search/:page', function(req, res){
    var str = req.params.search;
    var page = req.params.page;
    var replaced = str.split(' ').join('+');

    var _url = domain +'search?q=' + replaced + '&page='+page;

    console.log(_url);

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
       // setTimeout(function(){

            //console.log(data);

            //console.log($('.results > tbody  > tr').html());

            $('.results  > tbody > tr').each(function() {

                /*CarTitle = $(this).find('.lot-desc').text();//
                //listImageUrl = $(this).find('.lot-detail-image').attr('src');
                listImageUrl = $(this).find('.lot-detail-image').attr('data-original');
                listLot = $(this).find('.results-first-col li').first().text();
                listRetailValue = $(this).find('.results-first-col li:nth-child(2)').text();
                listRepairEst = $(this).find('.results-first-col li:nth-child(3)').text();
                listTitle = $(this).find('.results-first-col li:nth-child(4)').text();
                listMiles = $(this).find('.results-second-col li').first().text();
                listDamage = $(this).find('.results-second-col li:nth-child(3)').text();
                listSaleDate = $(this).find('.results-last-col .converted-time').text();
                listLocation = $(this).find('.results-last-col .location-block').text();*/
                CarTitle = $(this).find('.lot-desc').text();//
                listImageUrl = $(this).find('.lot-detail-image').attr('src');
                //listImageUrl = $(this).find('.lot-detail-image').attr('data-original');
                listLot = $(this).find('.results-first-col li').first().text();

                //listRetailValue = $(this).find('.results-first-col li:nth-child(2)').text();
                listRetailValue = $(this).find('.results-second-col li').first().text();

                listTitle = $(this).find('.results-first-col li:nth-child(4)').text();

                listRepairEst = $(this).find('.results-first-col li:nth-child(3)').text();
                //listMiles = $(this).find('.results-second-col li').first().text();
                listMiles = $(this).find('.results-first-col li:nth-child(4)').text();

                listDamage = $(this).find('.results-second-col li:nth-child(3)').text();
                listSaleDate = $(this).find('.results-last-col .converted-time').text();
                listLocation = $(this).find('.results-last-col .location-block').text();

                //console.log(listImageUrl);

                listLot = parseData(listLot);
                //undefined var
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
                console.log(dataArray);

            });



            res.jsonp(dataArray); //JSON.stringify(dataArr)
        //},5000);
    });

});

//////////////////////////////////////////////////////////////////
/// hot list search
//////////////////////////////////////////////////////////////////
//free search
app.get('/hotlist', function(req, res){
    //var str = req.params.search;
    //var page = req.params.page;
    //var replaced = str.split(' ').join('+');
    //console.log(replaced);

    var _url = domain +'search?FilterCodes=A&oc=True&ocN=automobiles&ocR=homepage&cn=a&searchTitle=Automobiles';
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
        // setTimeout(function(){


        $('.results  > tbody > tr').each(function() {

            CarTitle = $(this).find('.lot-desc').text();//
            listImageUrl = $(this).find('.lot-detail-image').attr('src');
            //listImageUrl = $(this).find('.lot-detail-image').attr('data-original');
            listLot = $(this).find('.results-first-col li').first().text();

            //listRetailValue = $(this).find('.results-first-col li:nth-child(2)').text();
            listRetailValue = $(this).find('.results-second-col li').first().text();

            listTitle = $(this).find('.results-first-col li:nth-child(4)').text();

            listRepairEst = $(this).find('.results-first-col li:nth-child(3)').text();
            //listMiles = $(this).find('.results-second-col li').first().text();
            listMiles = $(this).find('.results-first-col li:nth-child(4)').text();

            listDamage = $(this).find('.results-second-col li:nth-child(3)').text();
            listSaleDate = $(this).find('.results-last-col .converted-time').text();
            listLocation = $(this).find('.results-last-col .location-block').text();

            //console.log(listImageUrl);

            listLot = parseData(listLot);
            //undefined var
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
            console.log(dataArray);

        });



        res.jsonp(dataArray); //JSON.stringify(dataArr)
        //},5000);
    });

});
app.get('/filterResult/:queryString', function(req, res){
    //var queryString = '&Page=1&LotTypes=V&RadioGroup=Location&PostalCode=&Distance=99999&YearFrom=2000&YearTo=2015&States=&SearchTitle=2000-2015%2CACURA%2C&YardNumber=&zipFilter=0&cn=2000-2015%2CACURA%2C&vf_titlgroup=&InitialFilters=ACUR&OriginalCount=810&ZipSort=0&PageSize=20&Years=2002&Make=ACUR&Sort=sd';
    //var str = req.params.search;
    //var page = req.params.page;
    //var replaced = str.split(' ').join('+');
    //console.log(replaced);
    var parsed_QS = removeBlank(req.params.queryString);
    var _url = 'http://ww2.copart.com/us/search?q='+parsed_QS;
    var options = { url: _url, include: true };
    var _data = '';

    console.log("query string:"  + req.params.queryString);
    console.log(_url);

    curl.request(options, function (err, data) {
        _data += data;

        console.log(_data);
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
        // setTimeout(function(){


        $('.results  > tbody > tr').each(function() {

            CarTitle = $(this).find('.lot-desc').text();//
            listImageUrl = $(this).find('.lot-detail-image').attr('src');
            //listImageUrl = $(this).find('.lot-detail-image').attr('data-original');
            listLot = $(this).find('.results-first-col li').first().text();

            //listRetailValue = $(this).find('.results-first-col li:nth-child(2)').text();
            listRetailValue = $(this).find('.results-second-col li').first().text();

            listTitle = $(this).find('.results-first-col li:nth-child(4)').text();

            listRepairEst = $(this).find('.results-first-col li:nth-child(3)').text();
            //listMiles = $(this).find('.results-second-col li').first().text();
            listMiles = $(this).find('.results-first-col li:nth-child(4)').text();

            listDamage = $(this).find('.results-second-col li:nth-child(3)').text();
            listSaleDate = $(this).find('.results-last-col .converted-time').text();
            listLocation = $(this).find('.results-last-col .location-block').text();

            //console.log(listImageUrl);

            listLot = parseData(listLot);
            //undefined var
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
            //console.log(dataArray);

        });

        res.jsonp(dataArray); //JSON.stringify(dataArr)

    });

});

//////////////////////////////////////////////////////////////////

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

    console.log(_url);

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
        $('.searchpaging > li > a').each(function(){
            //console.log($(this));
            //console.log($(this).text());
            if(!isNaN($(this).text()) ){
                $(this).attr('href','/busqueda/'+req.params.search+'/'+$(this).text());
            }else{
                //_href =  $(this).attr('href');
                _href =  $(this).text(); //updated from 04/21/2014 Copart removes href attr
                console.log($(this));
                //_parsedHref = _href.split('Page=');
                $(this).attr('href','/busqueda/'+req.params.search+'/'+_href);
            }
        });
        $( ".searchpaging > li" ).last().remove();

        paging = $('.searchpaging').html();

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


app.get('/lote/:lot/all',function(req,res){

    /*

        Get the images first

     */
    var str = req.params.lot;
    var replaced = str.split(' ').join('+');
    var _url =  domain +'Lot/' + str + '/Photos';
    var options = { url: _url, include: true };
    var _data = '';

    var imagesAr = [];
    var _img;

    var mainObject= {};

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

        mainObject.images = imagesAr; //JSON.stringify(dataArr)
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

            mainObject.data = dataObj;
            //console.log(mainObject);
           res.jsonp(mainObject); //JSON.stringify(dataArr)
        });




    });





})


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
                _Location = $(this).find('.lot-content').find('a').first().html();
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
app.get('/getCarList/:make/:model/:yearFrom/:yearTo/:page/:optional?*', function(req, res){
    //http://localhost:5000/getCarList/TOYT/ECHO/2001/2015/1
    var _yearFrom, _yearTo, model;

    (!req.params.yearFrom)? _yearFrom = 1965 : _yearFrom = req.params.yearFrom;
    (!req.params.yearTo)? _yearTo = date.getFullYear() : _yearTo = req.params.yearTo;

    model = (req.params.model=='*' ? '' : req.params.model);
    make = (req.params.make=='*' ? '' : req.params.make);

    var _url = domain +'search?companyCode_vf=US&LotTypes=V&YearFrom='+_yearFrom+'&YearTo='+_yearTo+'&Make='+ make +
                '&ModelGroups='+model+'&RadioGroup=Location&YardNumber=&States=&PostalCode=&Distance=0&' +
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
        $('.results  > tbody > tr').each(function() {

            CarTitle = $(this).find('.lot-desc').text();//
            listImageUrl = $(this).find('.lot-detail-image').attr('src');
            //listImageUrl = $(this).find('.lot-detail-image').attr('data-original');
            listLot = $(this).find('.results-first-col li').first().text();

            //listRetailValue = $(this).find('.results-first-col li:nth-child(2)').text();
            listRetailValue = $(this).find('.results-second-col li').first().text();

            listTitle = $(this).find('.results-first-col li:nth-child(4)').text();

            listRepairEst = $(this).find('.results-first-col li:nth-child(3)').text();
            //listMiles = $(this).find('.results-second-col li').first().text();
            listMiles = $(this).find('.results-first-col li:nth-child(4)').text();

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


//Get Detail Parameters
app.get('/getCarFilters/:make/:model/:yearFrom/:yearTo/:page', function(req, res){
    //http://localhost:5000/getCarList/TOYT/ECHO/2001/2015/1
    var _yearFrom, _yearTo, model;

    (!req.params.yearFrom)? _yearFrom = 1965 : _yearFrom = req.params.yearFrom;
    (!req.params.yearTo)? _yearTo = date.getFullYear() : _yearTo = req.params.yearTo;

    if(req.params.model=='*'){
        model = '';
    }else{
        model = req.params.model;
    }

    var _url = domain +'search?companyCode_vf=US&LotTypes=V&YearFrom='+_yearFrom+'&YearTo='+_yearTo+'&Make='+req.params.make+
        '&ModelGroups='+model+'&RadioGroup=Location&YardNumber=&States=&PostalCode=&Distance=0&' +
        'searchTitle=---++++++++++++++++++++++++%2CX5%2C&cn=---++++++++++++++++++++++++%2C---%2C&Page='+ req.params.page;
    var options = { url: _url, include: true };
    var _data = '';

    console.log(_url);

    curl.request(options, function (err, data) {

        _data += data;
        //Start Paring the data

        $ = cheerio.load(_data);
        var car_filter = $('.filter-holder').html();

        if(car_filter === null){
            setInterval(function(){
                console.log(car_filter);
            },2000)
        }else{
            console.log(car_filter);
            console.log('die');
        }

        setTimeout(function(){


        },5000)



    });



});


app.get('/getCarListPagination/:make/:model/:yearFrom/:yearTo/:page', function(req, res){
    var _yearFrom, _yearTo,model;

    (!req.params.yearFrom)? _yearFrom = 1965 : _yearFrom = req.params.yearFrom;
    (!req.params.yearTo)? _yearTo = date.getFullYear() : _yearTo = req.params.yearTo;

    model = (req.params.model=='*' ? '' : req.params.model);
    make = (req.params.make=='*' ? '' : req.params.make);
    
    var page = Number(req.params.page);


    var _url = domain +'search?companyCode_vf=US&LotTypes=V&YearFrom='+_yearFrom+'&YearTo='+_yearTo+'&Make='+req.params.make+
        '&ModelGroups='+model+'&Page='+ req.params.page;
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



        //set paging
        var _href, _parsedHref;
        $('.searchpaging > li > a').each(function(){
            //console.log($(this));
            //console.log($(this).text());
            if(!isNaN($(this).text()) ){
                $(this).attr('href','/busquedas/'+req.params.make+'/'+req.params.model+'/'+_yearFrom+'/'+_yearTo+'/'+$(this).text());
            }else{
                //_href =  $(this).attr('href');
                var nextPage = page + 1;
                var previusPage = page = 1;
                var _page;


                _href =  $(this).text(); //updated from 04/21/2014 Copart removes href attr
                console.log($(this));
                //_parsedHref = _href.split('Page=');
                //$(this).attr('href','/busqueda/'+req.params.search+'/'+_href);
                $(this).attr('href','/busquedas/'+req.params.make+'/'+req.params.model+'/'+_yearFrom+'/'+_yearTo+'/'+nextPage);
            }
        });
        $( ".searchpaging > li" ).last().remove();

        paging = $('.searchpaging').html();

        pagingObj = {
            "paging" : paging
        }
        /*dataArray.push(pagingObj);*/

        res.jsonp(pagingObj); //JSON.stringify(dataArr)
    });

});

app.get('/getCarFilterPagination/:queryString', function(req, res){
    var parsed_QS = removeBlank(req.params.queryString);
    var _url = 'http://ww2.copart.com/us/search?q='+parsed_QS;
    var options = { url: _url, include: true };
    var _data = '';

    console.log('pagination url:' + _url);



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
        $('.searchpaging > li > a').each(function(){
            console.log($(this));
            //console.log($(this).text());
            if(!isNaN($(this).text()) ){
                $(this).attr('href','#');
                $(this).addClass('filter_pag');
                $(this).data('href',$(this).text());

            }else{
                $(this).addClass('filter_pag');
                _href =  $(this).text(); //updated from 04/21/2014 Copart removes href attr

                //$(this).attr('href','/busqueda/'+req.params.search+'/'+_href);
                $(this).attr('href','#');
                $(this).data('href',_href);
            }
        });
        $( ".searchpaging > li" ).last().remove();

        paging = $('.searchpaging').html();

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
        $('.results  > tbody > tr').each(function() {

            CarTitle = $(this).find('.lot-desc').text();//
            listImageUrl = $(this).find('.lot-detail-image').attr('src');
            //listImageUrl = $(this).find('.lot-detail-image').attr('data-original');
            listLot = $(this).find('.results-first-col li').first().text();

            //listRetailValue = $(this).find('.results-first-col li:nth-child(2)').text();
            listRetailValue = $(this).find('.results-second-col li').first().text();

            listTitle = $(this).find('.results-first-col li:nth-child(4)').text();

            listRepairEst = $(this).find('.results-first-col li:nth-child(3)').text();
            //listMiles = $(this).find('.results-second-col li').first().text();
            listMiles = $(this).find('.results-first-col li:nth-child(4)').text();

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
        $('.searchpaging > li > a').each(function(){
            //console.log($(this));
            //console.log($(this).text());
            if(!isNaN($(this).text()) ){
                $(this).attr('href','/busqueda/'+req.params.search+'/'+$(this).text());
            }else{
                //_href =  $(this).attr('href');
                _href =  $(this).text(); //updated from 04/21/2014 Copart removes href attr
                console.log($(this));
                //_parsedHref = _href.split('Page=');
                $(this).attr('href','/busqueda/'+req.params.search+'/'+_href);
            }
        });
        $( ".searchpaging > li" ).last().remove();

        paging = $('.searchpaging').html();

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


/***********     VIN DECODER Functions   **************/

app.get('/vin/:vin', function(req, res){

    var _url = 'http://www.decodethis.com/VIN-Decoded/vin/'+req.params.vin;
//        var _url = iaaiDomain;
    var options = { url: _url, include: true };
    var _data = '';



    curl.request(options, function (err, data) {
        _data += data;
        //Start Paring the data
        $ = cheerio.load(_data);
        var info = $('.cardata').html();

        var datable = {
            "data" : '<table class="table vin-table">'+info+'</table>'
        }
        /*dataArray.push(pagingObj);*/

        res.jsonp(datable); //JSON.stringify(dataArr)
    });

});
var ipaddr = process.env.OPENSHIFT_INTERNAL_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_INTERNAL_PORT || 5000;

//app.listen(port)
app.listen(process.env.PORT || 5000)
console.log('Listening on port 5000');