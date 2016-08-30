document.addEventListener("deviceready", function(){

navigator.splashscreen.show();

var jsonGen = [];

var jsonCat = [];

if(navigator.connection.type != Connection.NONE){
  $.ajax({
    url: "http://y-mobile-ws.yachay.gob.ec/ws/info/igen",
    success: function(dataGen) {
        jsonGen = dataGen;
        $.ajax({
        url: "http://y-mobile-ws.yachay.gob.ec/ws/info/icat",
        success: function(dataCat) {
          jsonCat = dataCat;
          navigator.splashscreen.hide();
          $(':mobile-pagecontainer').pagecontainer('change', '#pagetwo', {
            transition: 'pop',
            reverse: false
          });
        },
        error: function() {
          navigator.splashscreen.hide();
          swal({
              title: 'Error!',
              text: 'No se pudo conectar al servidor.',
              type: 'error', 
              showCancelButton: false,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'Aceptar',
              closeOnConfirm: false
            }).then(function(isConfirm) {
              if (isConfirm) {
                navigator.app.exitApp();
              }
            }); 
        }
      });
    },
    error: function() {
      navigator.splashscreen.hide();
      swal({
            title: 'Error!',
            text: 'No se pudo conectar al servidor.',
            type: 'error', 
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Aceptar',
            closeOnConfirm: false
          }).then(function(isConfirm) {
            if (isConfirm) {
              navigator.app.exitApp();
            }
          });
    }
  });
}else{
  navigator.splashscreen.hide();
}


$(document).on('pagecreate', '#pagetwo', function(){
    var li = "";
    $.each(jsonCat, function (i, categorias) {
        li += '<li><a href="#" id="' + i + '" title="' + categorias.titulo + '" class="ui-btn ' 
      + categorias.icon + ' ui-btn-icon-left cat-go">' + categorias.titulo + '</a></li>';
    });
    $('#lista-menu').append(li).promise().done(function () {
        $(this).on('click', '.cat-go', function(e){
          e.preventDefault();
          $('#pagefour').data('info', jsonCat[this.id]);              
          $(':mobile-pagecontainer').pagecontainer('change','#pagefour');
        });
        $(this).listview('refresh');
    });
    li = "";
    $.each(jsonGen, function (j, general) {
      if(general.titulo.toLowerCase().localeCompare("servicios")!=0){
        li+='<li><a href="#" class="ui-btn '+general.icono+' ui-btn-icon-left inf-ciudad" id="'
        + j +'">'+ general.titulo + '</a></li>';
      }
    });
    li+='<li><a href="#panel" data-role="button" class="ui-btn ui-icon-check ui-btn-icon-left">Servicios</a></li>';
    $('#lista-general').append(li).promise().done(function () {
      $(this).on('click', '.inf-ciudad', function(e){
          e.preventDefault();
          $('#pagethree').data('infog', jsonGen[this.id]);              
          $(':mobile-pagecontainer').pagecontainer('change','#pagethree');
        });
        $(this).listview('refresh');
    });
});

$(document).on('pagebeforeshow', '#pagethree', function () {
  var infogen = $(this).data('infog');
  var textoInf = validateGallery('catowl',infogen.imgs)+'<h2 class="titulo">'+infogen.titulo+'</h2>';
  textoInf += '<p style="text-align: justify;">'+fullDescripcion(infogen.descripcion)+'</p>';
  $(this).find(".ui-header .ui-title").text(infogen.titulo);
  $(this).find('#catciud').html(textoInf);
  $(this).find("#catowl").owlCarousel({autoPlay: 3000, slideSpeed : 300, pagination: false, singleItem: true});
});

$(document).on('pagebeforeshow', '#pagefour', function () {
    var info = $(this).data('info');   
    var lisitios = '<ul class="ui-listview" data-role="listview" id="listsit">';
    $.each(info.informacion, function (j, sitio){
      lisitios+='<li><a href="#" id="'+j+'" class="ui-btn ui-btn-icon-right ui-icon-yachay li-sitio">'+
      '<font style="text-transform: capitalize;">'+sitio.titulo+'</font></a></li>';
    });
    lisitios += '</ul>';
    $(this).find(".ui-header .ui-title").text(info.titulo); 
    $(this).find("#catcont").html(lisitios).promise().done(function(){
      $(this).find('#listsit').on('click', '.li-sitio', function(event) {
        event.preventDefault();
        $('#pagefive').data('infosit', info.informacion[this.id]);
        $(':mobile-pagecontainer').pagecontainer('change','#pagefive');
      });
    });
});

$(document).on('pagebeforeshow', '#pagefive', function() {
  var infosit = $(this).data('infosit');
  var texto = validateGallery('infowl',infosit.imgs)+'<h2 class="titulo">'+infosit.titulo+'</h2>';    
  if(infosit.fecha.localeCompare('1900-01-01')!=0){
    texto+='<p style="text-align: right; font-style: italic;">'+infosit.fecha+'</p>';
  }
  texto += '<p style="text-align: justify;">'+fullDescripcion(infosit.descripcion)+'</p>';
  if(infosit.url.localeCompare('-')!=0){
    texto += '<p style="text-align: right; font-style: italic;"><a href="#" id="leer">Leer m&aacute;s</a></p>';
  }
  if(infosit.latitud.localeCompare('0')!=0){
    texto += '<a href="#" id="vermapa" class="ui-btn ui-btn-c ui-icon-map ui-btn-icon-left ui-btn-inline">Ver mapa</a>';
  }
  $(this).find(".ui-header .ui-title").text(infosit.titulo); 
  $(this).find('#contsitio').html(texto).promise().done(function(){
      $(this).find('#vermapa').click(function() {
        $('#pagesix').data('infomapa', infosit.latitud+";"+infosit.longitud+";"+infosit.titulo);
        $(':mobile-pagecontainer').pagecontainer('change','#pagesix');
      });
      $(this).find('#leer').click(function() {
          cordova.InAppBrowser.open(''+infosit.url, '_blank', 'location=yes');
      });
   });
  $(this).find("#infowl").owlCarousel({autoPlay: 3000, slideSpeed : 300, pagination: false, singleItem: true});
});

$(document).on('pagebeforeshow', '#pagesix', function() {
  var infmapa = $(this).data('infomapa');
  var coor = infmapa.split(";");
  var defaultLatLng = new google.maps.LatLng(0.4044186,-78.17527749999999);
  var posicion = new google.maps.LatLng(coor[0],coor[1]);
  var divmapa = document.getElementById("contmapa");
  if (navigator.geolocation) {
    function success(pos) {
      drawSingleMap(posicion,divmapa, coor[2]);
    }
    function fail(error) {
      drawSingleMap(posicion,divmapa, coor[2]);
    }
    navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 15000, enableHighAccuracy:true, timeout: 6000});
  } else {
    drawSingleMap(posicion,divmapa, coor[2]);
  }

  $(this).find('#miUbicacion').click(function() {
      if (navigator.geolocation) {
        function success(pos) {
          drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),posicion,divmapa, coor[2]);
        }
        function fail(error) {
          drawMap(defaultLatLng,posicion,divmapa, coor[2]);
          swal("Falla ubicaci\xf3n","Favor encender su GPS","info");
        }
        navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 15000, enableHighAccuracy:true, timeout: 6000});
      } else {
        drawMap(defaultLatLng,posicion,divmapa, coor[2]);
        swal("Error geolocalizaci\xf3n","Tiene la posici\xf3n por defecto","info");
      }
  });
});

function fullDescripcion(cadena){
  var str = cadena.split('\n');
  var descripcion ='';
  for (i = 0; i < str.length; i++) {
    descripcion += str[i]+"<br/>";
  }
  return descripcion;
};

function drawSingleMap(mylatlng, mapcanvas, titleSend) {
  var myOptions = {
    zoom: 16,
    center: mylatlng,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    zoomControl: true
  }
  var map = new google.maps.Map(mapcanvas, myOptions);
  var infowindow = new google.maps.InfoWindow({
      content: ''
    });
  var marcadores = [
    {
      position: mylatlng,
      icon: "img/icon.png",
      contenido: titleSend
    }                      
  ];
  for(var i = 0, j = marcadores.length; i < j; i++) {
    var contenido = marcadores[i].contenido;
    var marker = new google.maps.Marker({
      position: marcadores[i].position,
      icon: marcadores[i].icon,
      map: map
    });
    (function(marker, contenido){                      
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contenido);
        infowindow.open(map, marker);
      });
    })(marker,contenido);
  }
};

function drawMap(latlng, mylatlng, mapcanvas, titleSend) {
  var myOptions = {
    zoom: 16,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    draggable: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    zoomControl: true
  }
  var map = new google.maps.Map(mapcanvas, myOptions);
  var infowindow = new google.maps.InfoWindow({
      content: ''
    });
  var marcadores = [
    {
      position: latlng,
      contenido: "Estoy aqu&iacute;"
    },
    {
      position: mylatlng,
      icon: "img/icon.png",
      contenido: titleSend
    }                      
  ];
  for(var i = 0, j = marcadores.length; i < j; i++) {
    var contenido = marcadores[i].contenido;
    var marker = new google.maps.Marker({
      position: marcadores[i].position,
      icon: marcadores[i].icon,
      map: map
    });
    (function(marker, contenido){                      
      google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contenido);
        infowindow.open(map, marker);
      });
    })(marker,contenido);
  }

};

$(".owl-demo").owlCarousel({
  autoPlay: 3000, //Set AutoPlay to 3 seconds
  slideSpeed : 300,
  paginationSpeed : 400,
  singleItem:true
});

function validateGallery(id,jsonImg){
  if(isArrayEmpty(jsonImg))
    return '';
  else
    return makeGallery(id,jsonImg);
}

function isArrayEmpty(array) {
    return array.filter(function(el) {
        return !jQuery.isEmptyObject(el);
    }).length === 0;
};

function makeGallery(id,jsonImg){
  var owl ='<div id="'+id+'" class="owl-demo owl-carousel owl-theme">';
  for (var i = 0; i < jsonImg.length; i++) { 
      owl+='<div class="item"><img src="'+jsonImg[i].url+'" alt="'+jsonImg[i].nombre+'"></div>';
  }
  owl+='</div>';
  return owl;
};

function handleBackButton(){
  if($.mobile.activePage.attr('id') == 'pagetwo'){ 
    swal({
      title: "Salir",
      text: "Desea cerrar la aplicaci\xf3n?",
      type: "question", 
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      closeOnConfirm: false
    }).then(function(isConfirm) {
      if (isConfirm) {
        navigator.app.exitApp();
      }
    });
  }else{ 
      navigator.app.backHistory(); 
  } 
}

document.addEventListener("backbutton", handleBackButton, true);

function onOffline() {
  swal({
    title: "Conexi\xf3n a Internet!",
    text: "No tiene acceso a internet!. Cerrando la aplicaci\xf3n",
    type: "error", 
    showCancelButton: false,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Aceptar',
    closeOnConfirm: false
  }).then(function(isConfirm) {
    if (isConfirm) {
      navigator.app.exitApp();
    }
  });  
}
  
document.addEventListener("offline", onOffline, false);

}, false);