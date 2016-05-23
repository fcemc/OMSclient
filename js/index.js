//https://github.com/phonegap/phonegap-plugin-push

var pushNotification;

var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    bindEvents: function () {
        document.addEventListener('deviceready', onDeviceReady, true);
    },
    onDeviceReady: function () {
        app.receivedEvent('deviceready');
    },
    receivedEvent: function (id) {
        var _id = id;
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');
    }
};

function onDeviceReady() {
    document.addEventListener("resume", onResume, false);

    document.addEventListener("backbutton", function (e) {
        if ($("#home").length > 0) {
            // call this to get a new token each time. don't call it to reuse existing token.
            //pushNotification.unregister(successHandler, errorHandler);
            e.preventDefault();
            navigator.app.exitApp();
        }
        else {
            navigator.app.backHistory();
        }
    }, false);   

    var push = PushNotification.init({
        android: {
            senderID: "18994795059",
            sound: "true",
            vibrate: "true"
        },
        ios: {
            alert: "true",
            badge: "true",
            sound: "true",
            clearBadge: "true"
        },
        windows: {}
    });

    push.on('registration', registerDevice);
    push.on('notification', notifyDevice);
    push.on('error', pushError);
}

function onResume() {    
    $(":button").each(function () {
        if ($(this).attr('id') != undefined) {
            if ($(this).attr('id').includes("btn_")) {
                if ($(this).prop('disabled') == true) {
                    checkCookie();
                    return false;
                }
            }
        }
    });
}

function registerDevice(data) {
    if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos') {
        localStorage.setItem("fcemcOMS_MEM_clientType", "Android");
        localStorage.setItem("fcemcOMS_MEM_did", data.registrationId);
        localStorage.setItem("fcemcOMS_MEM_uuid", device.uuid);
    } else {
        localStorage.setItem("fcemcOMS_MEM_clientType", "iOS");
        localStorage.setItem("fcemcOMS_MEM_did", data.registrationId);
        localStorage.setItem("fcemcOMS_MEM_uuid", device.uuid);
    }
}

function notifyDevice(data) {
    if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos') {
        data.message,
        data.title,
        data.count,
        data.sound

        var my_media = new Media("/android_asset/www/" + data.sound);
        my_media.play();

        // data.image,
        // data.additionalData
    } else {
        data.message,
        data.title,
        data.count,
        data.sound

        var snd = new Media(data.sound);
        snd.play();

        // data.image,
        // data.additionalData
    }

}

function pushError(e) {
    alert(e.message);
}
