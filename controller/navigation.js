import {UserStorageService} from "../services/UserStorageService.js";

$(document).ready(function () {
    $('#navigation').load('../views/navigation.html');
    if(UserStorageService.isLoggedIn()) {

    }


});
