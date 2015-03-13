//Curl Request Dependency
var curl = require('curlrequest');
//DOM Depency
var cheerio = require('cheerio')
/*
* @method nba.index list the posible methods for NBA API
* @return JSON response
*/
exports.getDetails = function(req, res){ 
    //Get Car details
    var domain = 'http://ww2.copart.com/us/';
    var loteId = req.params.lot;    


    curl.request({ url: domain +'Lot/' + loteId, include: true }, function (err, data) {

    //     _data += data;
    //     //Start Paring the data
        $ = cheerio.load(data);
        var odometer, highlight, primaryDamage, secondaryDamage,
            estRetailValue, bodyStyle, drive, engineType, vin, color,
            cylinder, fuel, location; 

        var details = $('.details_module');
        var title = details.find('.details_content').text();
        var labels = details.find('label');
            $(labels).each(function(i,el){
                var label = $(this).text();
                var that = $(this);
                var text  = $(this).parent().text().replace( /[\r\n]/gm,'').trim();
                switch(label){
                    case 'Odometer:':
                        odometer = text;
                        break;
                    case 'Highlights:':
                        highlight = that.parent().find('.downloads').text().replace( /[\r\n]/gm,'').trim();
                        break;
                    case 'Primary Damage:':
                        primaryDamage = $(this).parent().text().replace("Primary Damage:","");
                        break;
                    case 'Secondary Damage:':
                        secondaryDamage = $(this).parent().text().replace("Secondary Damage:","");
                        break;
                    case 'Est. Retail Value:':
                        estRetailValue = $(this).parent().text().replace("Est. Retail Value:","");
                        break;    
                    case 'Body Style:':
                        bodyStyle = $(this).parent().text().replace("Body Style:","");
                        break;
                    case 'Drive:':
                        drive = $(this).parent().text().replace("Drive:","");
                        break;
                    case 'Engine Type:':
                        engineType = $(this).parent().text().replace("Engine Type:","");
                        break;                    
                    case 'Color:':
                        color = $(this).parent().text().replace("Color:","");
                        break;  
                    case 'Cylinder:':
                        cylinder = $(this).parent().text().replace("Cylinder:","");
                        break;
                    case 'Fuel:':
                        fuel = $(this).parent().text().replace("Fuel:",""); 
                        break;
                    case 'VIN:':
                        vin = $(this).parent().text().replace("VIN:","").replace( /[\r\n]/gm,'').trim();
                        break;
                    case 'Location:':
                        location  = $(this).parent().text().replace("Location:","").replace( /[\r\n]/gm,'').trim();
                        break;                      
                }

            });
                
            var saleDate = $('.converted-time').attr('data-original-time');
            var carTitle = $('#TitleHead').find('h2').text().trim();
        res.jsonp({
            'carTitle' : carTitle,
            'odometer' : odometer,
            'highlight': highlight,
            'PrimaryDamage' : primaryDamage,
            'SecondaryDamage' : secondaryDamage,
            'EstRetailValue' : estRetailValue,
            'BodyStyle' : bodyStyle,
            'Drive' : drive,
            'EngineType' : engineType,
            'Color' : color,
            'Cylinder' : cylinder,
            'Fuel' : fuel,
            'Location' : location,
            'SaleDate' : saleDate,
            'Vin' : vin
        });
    });

};




exports.getImages = function(req, res){ 
    //Get Images
        var domain = 'http://ww2.copart.com/us/';
        var loteId = req.params.lot;    
        var imagesAr = [];

        curl.request({ url: domain +'Lot/' + loteId + '/Photos', include: true }, function (err, data) {
            
            //Start Paring the data
            $ = cheerio.load(data);

            
            $('.lot-photos li').each(function(index){
                var src = $(this).find('img').attr('src');
                if(src!=null)
                    imagesAr.push(src);
            });

            imagesAr.pop();

            res.jsonp(imagesAr); //JSON.stringify(dataArr)
        });    
}
