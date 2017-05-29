angular.module('starter.controllers', [])

.controller('MapCtrl', function($scope , $state , $cordovaGeolocation) {
  var options = {timeout : 10000 , enableHighAccuracy : true};
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    //  var latlang=new google.maps.LatLang(position.coords.latitude , position.coords.longitude);
    var LatLang = {lat : position.coords.latitude , lng : position.coords.longitude};
    var mapOptions = {
      center : LatLang,
      zoom : 15,
      mapTypeId : google.maps.MapTypeId.ROADMAP
    };
    $scope.map=new google.maps.Map(document.getElementById("map") , mapOptions);
    google.maps.event.addListenerOnce($scope.map , 'idle' , function(){
      var marker = new google.maps.Marker({
        map : $scope.map,
        animation : google.maps.Animation.DROP,
        position : LatLang
      });

      var infoWindow = new google.maps.InfoWindow({
        content : "You are Here"
      });

      google.maps.event.addListener(marker , 'click' , function(){
        infoWindow.open($scope.map , marker);
      })

    })

  } , function(err){
    console.log(err);
  });//$cordovaGeolocation

})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})
.controller('mAddCtrl' , ['$scope' , '$ionicModal' , '$cordovaGeolocation' ,'$firebaseObject' , '$firebaseArray' ,'PrayerTimingService' ,'GetCurrentLocationService',
function($scope , $ionicModal , $cordovaGeolocation, $firebaseObject,$firebaseArray ,PrayerTimingService , GetCurrentLocationService){
  //Create DB Ref..l̥ṣ.`

  const dbRefObject = firebase.database().ref().child('masjid');
  // console.log($scope.masjid);
  $scope.masjid={};
  $ionicModal.fromTemplateUrl('templates/AddPrayerTimeModal.html' , {
    scope: $scope,
      animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modal=modal;
  });
  $scope.openModal=function(){
    $scope.modal.show();
  };

  $scope.closeModal=function(){
    $scope.modal.hide();
  };
  $scope.destroyModel=function(){
    $scope.modal.remove();
  };

  //Cleanup the modal when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.modal.remove();
   });

   // Execute action on hide modal
   $scope.$on('modal.hidden', function() {
      // Execute action
   });

   // Execute action on remove modal
   $scope.$on('modal.removed', function() {
      // Execute action
   });
   $scope.submitMasjid=function(masjid){

      console.log(PrayerTimingService.getSalah());
      masjid.salahTime=PrayerTimingService.getSalah();
      masjid.lat=GetCurrentLocationService.$$state.value.lat;
      masjid.lng=GetCurrentLocationService.$$state.value.lng;
       console.log(masjid);
      firebaseArrayRef= $firebaseArray(dbRefObject);
      firebaseArrayRef.$add(masjid).then(function(results){
        console.log(results);
      })

   }
   $scope.addPrayerTime=function(salah){
        console.log(salah);
     PrayerTimingService.setSalah(salah);
     $scope.modal.hide();
   };


}])

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };

  const dbRefObject = firebase.database().ref().child('masjid');
  dbRefObject.on('value' , snap =>{
    $scope.mList=JSON.stringify(snap.val() , null , 3);
    console.log($scope.mList);
  });
   var geoFire = new GeoFire(dbRefObject);
  var fishLocations = [
      [-16.130262, 153.605347],   // Coral Sea
      [-66.722541, -167.019653],  // Southern Ocean
      [-41.112469, 159.054565],   // Tasman Sea
      [30.902225, -166.66809]     // North Pacific Ocean
    ];

    for (var i = 0; i < fishLocations.length; i++) {
      geoFire.set("fish"+i ,fishLocations[i]).then(function(){
          log(`fish${i} initially set to [${fishLocations[i]}]`);
      }).catch(function(err){
        console.log(err);
      });
    }
    log("*** Updating locations ***");
    newLocation = [-53.435719, 140.808716];
    geoFire.set("fish1" , newLocation).then(function(){
      log(`fish1 moved to [${newLocation}]`);
    }).catch(function(err){
      log(err);
    });
      newLocation = [56.83069, 1.94822];
      geoFire.set("fish2" , newLocation).then(function(){
        log(`fish2 moved to [${newLocation}]`);
      }).catch(function(err){
        log(err);
      });
      geoFire.remove("fish0").then(function(){
        log("fish0 removed from GeoFire");
      }).catch(function(err){
        log(err);
      });

      document.getElementById("getFishLocation").addEventListener("click" , function(){
        var selectedFishKey = document.getElementById("fishSelect").value;
        geoFire.get(selectedFishKey).then(function(location){
          if (location===null) {
            log(`${selectedFishKey} is not in GeoFire`);
          } else {
            log(`${selectedFishKey} is at location [${location}]`);
          }
        })
      })

});


function log(message){
  var childDiv = document.createElement("div");
  var textNode = document.createTextNode(message);
  childDiv.appendChild(textNode);
  document.getElementById("log").appendChild(childDiv);
}
