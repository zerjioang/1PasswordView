var selectedSection = "webforms";
var selectedEntry = null;
var selectedFolder = "";
var total_items = 0;
var current_sort_criteria = "Name";
var current_sort_ascending = true;
var entries = [];
var currentEntry = null;
var concealedFieldCount = 0;
var copyableEntries = {};
var lastSearchString = null;

function profileContentsDidFinishLoading(json) {
    if (!json || json == "") {
        var file = dataFolder + "/contents.js";
        showFatalMessage("Problem loading 1Password data file", "<p>A <a href='" + file + "'>key data file</a> could not be loaded and 1PasswordAnywhere cannot continue without it.</p><p>Please see <a href='http://help.agilebits.com/1Password3/1passwordanywhere_troubleshooting.html'>this help guide</a> for troubleshooting tips.</p>");
    }
    var allItems = null;

    try {
        allItems = eval(obj);
    } catch (exc) {
        var error_desc = exc.name + " occurred when parsing contents.js on line #" + exc.line + ":" + exc.message;
        showFatalMessageWithEmailSupportLink("1PasswordAnywhere experienced an error", error_desc);
    }

    keychain.setContents(allItems);

    renderSectionList();
    selectSection(TYPE_WEBFORMS);

    $("#search").val(""); // Sometimes reload does not clear the search criteria 
    lastSearchString = "";
    keychain.rescheduleAutoLogout();
}


var logins_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NzY0RUI5RTU3RDU0MTFERkFEOTdDRUMzQ0I1QThDM0QiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NzY0RUI5RTY3RDU0MTFERkFEOTdDRUMzQ0I1QThDM0QiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3NjRFQjlFMzdENTQxMURGQUQ5N0NFQzNDQjVBOEMzRCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3NjRFQjlFNDdENTQxMURGQUQ5N0NFQzNDQjVBOEMzRCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhYo1MgAAAQ1SURBVHjajJRLbFRlFMd/d+bO3E7n3Q6dtkAJpdUCQUARebnQiBtITIg2XbjwEY0L1+pCXcCClY+dS3aSYAxKgoayICpvgSLaDW0ptEM70+k87rx7H3M9d1qEaIjc5CQ39/u+3znn+//PhSd7vCvxv4/y2JWXv9nGuq6Dr6yP7+3vbFuDA39lqvMX7xUvkKmc5szb154MuO1oD0N9Rw482zfy5r6B4Nb1MeIhX2sppy9xbbrIsV8n67+Mz3+HXv6M0+/NPB44dHjThoM7Try+c3DznoEoXTENRVHQVAWPV8E0HWqGTVrAx6/c5+Slidv4fCMcOzT2X+D7p1dv742OfnBgy6ZVfgsMg+cG4vg9Ckt2k1TRpLpko9ctilWDjN7g1K00qqJO3syWXq1/uX/axXge8AZ7Ykde2j20KRHxkewIUjIcbqfKdEf8BH0e0mWLdMUSqMVCyeDeYoU9/R28sL1/oDccPOrhsId/lHv3x20b+5Nfb+yLqoVcCce0mJcKIgFfq8XfZ2rMlg3ifi87+qMEND+qT6WnO07VdsiW6kOza0NnufFtSm0Bo6HXwtFIW7lhk9A0/JF28nNlTo4vEhRoSMLvOOxaE6bR9OALaCSTKindwD0TisVUgtlDQrqkrrhsX9PjoSJ3pHm9jI7NMZOvkrWadAUd7FyD4c0Jah6VQtkmV7PICShbM9HlCgxJhl/d7WqitnB373ePysvO7kgLlK7UIdROuF3jjogQl7XpwhKmWqFuywG/Rl6+FwSsC7TUEBFt4grDHjHEME4+r9AZ52qlKkclW3sAmra0Y7QaeDrSRiAY4Pj5ac7PFRl+Zi2JZJzFiimVWmSMpux3T2YV1eGEjbMrTUHfTCwkmWSlJhXafvBJOZbN6v4Elt/H81vWsbq3g6biZa7YICuwyzMLUpzbaFOHc/aybZr2eRqNVnGRDevAFFBVoG7r8gRjUe5k68yL0obXR0Es5QpyYWIO+/qfch8pScxlt71lUQzlFOXKJ3R3aaVAEHqSMCU+9cnIGSa37mblSjXMpoIlSYuSMCONkM2BKoiFtKiU/f6hD2dH0/Ttf4ola6srBh0ig9iHQrEFzMxmmJ1KMSfVZdsC5AVmliownxGgJNVLP3Dmw6/cCh9MiiNtfkqtOkFKNsm4kVwlvbYvV+mKFJTKE3FsMbRHk28VAUZicjXVu+RKH+Pq/OjocfGjGRrGGyxkJlwhxJCuP8Q+YQEKOBwmJNWvCrXRbCXshrI+TTo1wh+fTz7643z4zJ7NUO38mXBsLeHIALbIGXaBUl00QrI3gS6jZo5PWVy/8RNjV99h/Iubj/t9uXDpgYREkq1v7SXe9yLxnkGCYSE6okijSmpqkskrv5E+d0H2Lbi/SYm8hPlvoPsuPSKX1xoObSXEnKgre2QkcN3fcL0hobtaS9SXJwL+FmAAySfOymJyzIkAAAAASUVORK5CYII%3D";

var accounts_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAArJJREFUeNqsVN9rUnEUP07daps/mJCaWntZQSiFIsZS7Ic4Ah+2YLn3oH+gh94i6CF66GFQT71UD+EKgspBM3oqAnNCaTlmG67uhjlUUmfkr2vnfMmbd9eFDx34XM8538/38z3n+r1H1m634X+ajARlMhkEg0ETxrcRboSpz/1biLeIKwsLC1tMix4odhST7wKBwJjL5QKNRtOXWqlUgmg0CuFwuIihB0VTA7RQr9dvTk9Pj9ntdshkMpDP54Hn+X+COMSlPTMzM2OkQVoKemCVPofDAfF4nJ1cLBbB7XYz/+s3DkJPnjJ/bvYCHD5kYX4ikRC4TqcTQqGQj2JWIZ6oUiqVYDAYIJvNst9mswn3Hz4Cj/sU3J2fZyCfcrTWzZXL5aQxLFTYarUYyWw2M5AVCkW4dv0GGCZcoFAOsVyzUWO581M+EZf2koZQYUewG89eLIJ+/BgMDg3DiErLQD7laG03vyOo6JzQaDRE/yC1otIeAIPlCAwoGA145H3n0mxtN580JC132+RJJ3zMVGB1IyfkSNjrPQ1ezyTdDBFf1HKnwm7QhkuzZ2Bi3ChsIv/y3DmoVqsSvqjCXi2zRUUbqj+2hZh8vlmTdNOz5V6Cq+l1WNvIwjC+SzLyv6ytg9l0UMKVtNwLS69ew8Dg/r/vEP3niy/35EsqrFQqeP8KoNPpQKVSwaeVVRgxHhcEeeR9Xkn35IquDRJ20EZTqRRL5nI5oE/xwb07oFarRa2Vy2X2hXRzrVYrVfizW/D98vLyWaPRCMlkEmw2Gztxc3Nzz0mj1WoFbiwWg1qtFhXmIVYxpdfrH/v9fjVVRi30Y9Q2DZRIJFLGSi9i9UudAbuP5pnFYrmKQ+IExrp+BHFvAbv7wHHcLQzfYPxLmNhoSgTNptE/fj9Gd20HwZFPWr8FGAB4nuKFfCoviQAAAABJRU5ErkJggg%3D%3D";

var identities_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAoFJREFUeNqslFlu01AUhk/stBk8xGpMa1CFAlJ5i5oqFY8UifAM7CCFFbCCqCuougKygqqsoX0AXkib2RCpAlo1btMYZ/Bsc68VTJvBEIlfurKS3PvlP+ee3yHXdQErFArBuAgynHmeyxVWBOGlqmogtdsHR0eHO7Ztlcb3+pwAYGr79ZvP2WyWa4pfQZIksEwTWq0WnJyUNpwx6G9OGGZodfV+gSRIbn//ACzL+uOaICCZXCpcStKraedmAh3XTX34+AmmlRYCgpt1jpj1A2pABh8eX1jRWDyDWzKPwwxFsxzuKy6RJEnfnW3bwDAMNwKe/qvDktztnEajUaAZBhiWBRYtBIJYnALTNORpsMCSNU3boygKaJr2QBhI0QzQVByUnlKcG6goclHTVJlGUIZhkVPkkKa8si/Oz/bmvhQkWRSbO7FYHARhBe7dFQA7LpeP385yFzg2WN3rDlerVcAu297g9/t9uLqUuKAz40nBm/FIZCKR+PqzXC6v67qXEsdxvH2macEXsVF0XfsYX95oyRPRW0ry+a0nW+/WHq15o0KgP1B6PahUatCVZbBHaQmHw/DwQQoSiQQMh0MoV6tQr5a3Ead4q4fpdHo3s7EOLEN7N7mwEIZO5xpMBLqZchzDb99/QH8wAJ7n4fHmJiwvC7sTPcS5JUYvCMMw4Oz8wgM6tuMn5MZIQb3egGZT9FqlGwY3AVQ1HQZDFXT0bEtXXpkYbFmm37+JvE/53gf2ego0GqLXdAzBMA3B8XPcYZB8oCS1Szx/x3shWCivJgLhG8bZ/Zt+ynJp2tjgPuRpJvFicTHy1HHsQGeoXFlT1ZJp6u/RRzRGrnwL+L/0S4ABAO24Wb68BmVxAAAAAElFTkSuQmCC";

var secure_notes_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAjhJREFUeNqslN1qE0EUx/8zu5tEa2uNFzWJSbQppQgqpdeCb+IL+AL6BN74ToIXXhWkglBoaI1ISorNJptkN7vz4ZndjdkmzULEgWG+zvlx/jPnDNNa4382ezZhjL36VwgF9XkJSI1r/fPTujDG6q9vjTCZ+zR8WwP3fJFxY2EBY0BNcHx8jkplGzs793F62oXvh0uoo6OnpGmc+t0OdAAPkCO0ntzDxgYnywkatRKmUxtKadg2N3edWJMduJf6rZQ8JEPqyoc30JAygWxvFmFZHKNRACFlCowINcyV7GjtgokRzs8u4w2VZlS9toXygzvoXPyGH4h47/DFI7CimxshHQyAyMXLg2KaDhSIVHCcEEyH2G9atMeTs7APZuzzgFqTkRji4kd8Nyg4Fh5X72LoRrjs+SSbYXaFu81Nypl8YEEpFzwaQoXjVDJ5RwJcUldTiChTVfE8llxYGaFSfYAi3K3OHaNggBIlRqs2jy5uwjxIP1+yiRDCw8n3ybys0rFYYGg1Suj2IrieiA/KKOVLlpKAkYdKWcDijO4sU5cUnq0EztoSX74G4HT+LPoVV9/KPNSaZIgJqEAo34CJrzI1S11yBD7Hu49tys+ZK0OOZJPYyYP0rhS6V3OgkbxX59DC/gujqnljbnNlhFKa0gviRbWc9MX2cEvPYG9TWDdHMj3GobMEub7WcS2bqjtoKgN7nz6xgXVufGezH5uMPqzxb51kYO3sr58FtmhorAHtkG97cfOPAAMAWjLzjVHmAXoAAAAASUVORK5CYII%3D";

var software_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAotJREFUeNpi/P//PwM1ARMhBYyMjAxPGxtdgXgCiI0NowCQC/FhEOBnY9M5b27++UlDQyw2S1HU4zIE3SedbGynrwUEfAQaKorPQCaYt7B54UwQAw8QxwIx+3xW1invdu7k/P7p01Syw/DPP4ZeILXo33+GqTe+fl2z7ffv09937w4FutKGZAOBrmJ+/YPBHMRecJPhLZD6uoyNrefl5ctfP92/PwtoKDNyxMF9hyvZAIUPHDrEcNhPjWEbkKsNFWZPY2fffFZC4v/D2tosrKniza2DGCYysR1gEJSvZ7h0mJnh3es2Bl1dC7jcuUvXGb5mVDGo2doxiDXnMDCysaLoZXl7+yCacX8ZpK0nMPz6zsCwcaUYg4vVOwZkNfKcDAxrHXUYpLbuYmC112T4r8qJPwz55I4ycPN/ZDi2jYVBWNCaQViAG8NbVt6mDGcl+Bmun73E8I+RBbeBjMyfGITVDjC8e8HAsGeHHIONsSbW8JUU5Wf4HW7HcF/HlOEVoxJqGALxTBhn3z4GF0dHBqVZbQw/smoZ9vz9x/AMX7Ly9fX1cHR0lJ4xY8aqW7dufYanchDYOofB8sMrhv/3LjH8tzNimE1MPufl5fXR01LdumNB3Wx4pMAYe/Zxqdy+/u39m88Mbw+dY+gECv1Dz17I6Q4EPn/+vMPBwFiQ8e2lRZe3T7iu61nQxwhS2JjqKASkH5y5/vTg6Rt3dr56xzAFW35FNxAKFHriZI4bWTiJiCoa6YC99fHrT9Mfv/4wfPjyax3QsLmEvIpWiDw4fPvf5pe3j7G8e/OiGiwR5KAZIsDL0Q+UlCZkCI5SSdPTkG8nDydrAkxCAYi5iS0jcRRzhqA4YaR2FQAQYACebWDqB8uk6gAAAABJRU5ErkJggg%3D%3D";

var wallet_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAoFJREFUeNqclM9rE0EUx7+7m6Uhpmnrr9YkrWBCU63aSi3RBnr3ooIoEvTQFo/toYjQW8GTV2/iSSo9+EeIB1EJSsBgaDVBYk2ztrtJmmy62eyP+DYmkQZtmzz4MjNv5n32zZuZZarVKvYzhmFYasKkMdIzWp/YN8AC/k9kFmxu/Ob426n5qW/Uf0ry7xfDHpDZTPB2cCZ4Kxhyn3P7A7OBa+RboDk/aZDU3xrHHgSbvjMdsnxKUbH8fnaYvUvDVwjgObVL5OP3xLbWsAGbuDExN3Jl5KrwXcBGYgM6r8M16oJjzAEjYFQlu8QkFhNv8BoLxIg14m0tsB5qHrs8ruuyLJ9OZVIYCA5g+MEwnP1OFPQCJF2CoAkMNFoZwhABz1IvtifDcDgMXdcnbTZbBJ3ZZdKn1dXVPxmqqjrJ83zEc6SEi+cv4IR7CA5nDzgbh6phwjANaKqCXbkAXdOgaRUYuoa89AtFtYpoMv+xAa0BOY6LHOdEOHk7smIGuqGhy+6wLhVMnWA6ASxQpYxKRSW41ZZprNIHVJzkGQhqrwWtHYC1XThYFZ2ag6vUGM1DMQyjLcCPzS3E1lMolUowqRymaWJb6bIOdbltYL4gQ8gqePhoCW6PF/JOFjt5EdvCBmYXn7SfoZQrwjvohaEWsf75A+RCDnIxjxKp+VI0TTs08GivE+l0GqKY/ed8LUNBEIBTfYcC9vV041i3hBcrL6EoSrOGXzd3/wItRzt2ZnAA3v7e5rWxdliObCEejy+zjRoK+c6vTSZXbp4DW89w/v1aDj9FuW3YpqjgXVyqMZpv2efzXaL+KGmlwyTvk74kk8lo428TrWd7r0PgWp2B3wIMABWfXvvkzOF0AAAAAElFTkSuQmCC";

var passwords_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAApFJREFUeNqslc1OGlEUx/9DxrAgoBFFSNwQWFSUokhotRaTwgOQsDF0DwsegE2XdGGfoETdNixswgO0aUxsTF0ImNDEFWyIgUr4ijLD1/SeixAoLNR6kpM7M/ee/z2/c8/MCIqi4DlNCIVCBjb6mO8+MvaE+bd4PF4afSi22+13fr8/urGx8fIxaqlU6nUymeyxy8SYoCzLu/Pz8/br62sw8QeJzczMgGIodkKw2WyqAEVotWRcXKRwdHQEs9mM1VUbtre3MTs7OyFIa6lc3W53NxwOB0fRVUwQnU6H+9XVFXw+H2q1Go6PvyIW+zicm+ZOp3MlEAhEqWzDDO/u7iC3WvxGpVLBbrejWCyiUCigXC4jFApPZLi1tYXg+yAajQaWl5fH0MXb21vIcl+w2+uhzha12e491k60gdVqRb1eR6lUgsFgQKVSgcfj4TGS1ASVaxT9XlDuC3a7+Hl6inw+D4WJLxmN+LS/D6V/qnA4HLwsc3NzvCySJPMYQl9fX48mEokeR27dC7o2N3FwcACLxYK9vT243W5kMhkIgoAFvR6/s1lotVr8KfVbL51Oc5pRdDrlHrtQWJCgZ0GHh4egrKvVKnK53LCVqK5kkiTxkd6whcVFNt8ZolPHkOBJKpXeYYexdnNTBvlDjDZ7w9qKNhygU8dQY/+Ixz+r1Gr1B6/Xu0KLaSLL8HQ6HT8II6slZUbooijylnG5XLw0HSY4QKfy0atHLF9Yod9GIpEXhK7RaGAymbgI4dMpUwbTrMVaboBOa8XBBKGfnZ3tuN2v1mq1OsgfYpeXl0P0MUFCj8ViT0K32WwcnSMPBP8XncUr1DHivxNPRT8//5WlWGHKp2mJDd4nfnC/C8/9C/grwACwjsxQZSZRuQAAAABJRU5ErkJggg%3D%3D";

var trash_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABElJREFUeNqsVGtMm2UUfr7eaPmAUigbC1AQBg0sETJ1jAwhEwxzY5jgJQs6/OGMZMjgx/zHn8WM32SQGf95C+xiok7n9kMyopTKLgVqyGZm7y3dei+9tx/9PO1glrj98/1y8uWc7/2e9znnPO9heJ4HwzDYXmNjo7sikUhdMpluAvgKnufOgRGDdizT3ocMk34TEH4okQiNLMsaJicnXdv/ZrG2AcfHx9udj5wfxONcN7k1YrEYGRNJJKjcUwGegrFYBK7Hj5FMJpEgQxpmlpX+KpNJv5qamlrIYIkyyLOXLvN1dbVYXl6B0WiE2+NFPBpFIpGCKC8FfzCQPTQWiyFKcW5zE/lSKYqKCmtqa2tPHTjwyim1ujEDxWQZHn2jzzfw3glFe0c7SosVSHFppHkO4VAYPNEQCARgZSwixFCSZZ4HgVCAQrYQoUgY13/+CdPTF71LS1pllmE8EdHrV/WdQpEQhzs7Ub6nPFsTZWkporE48mXSJz49/kAQimL505qb9CY8ePAXHcr/maW4VcPjjY3q6YIihWp3WRmampoQ3NhAa2srOl5tp9QT2ZjZbIZOp0MwuIEIMTMaDVi6fRfBgN+8trY2Rlg/MjldPtnV/frXL9TUwGy14tOzZ8HmS3H9lxtwu93QLi6isEiO473HoFAo8NvvC/Q9P1vT2dmZgUwrMlgC/Lu+ETBMwmazYZdSiXg8jkOH2qFS1WDqwgV89PFplJQo0dPTg4aGBiqDDByXQiAQ4DJg2yC5gPD6fd5EIo6DbW2Qy+U4PXwG7w+cwIJGi5LiIux/aT8ufv4FtH8soZeYplIcXC6in7N2AKZSqfv19WoY/jbAYjZBra6Hz+/HjZs3qfObKCXmBawMxfJiaBY1aGs7SJlEjM8FFAmEtxxORyYNPCTQ0TMjqKysxPnPzpFkopibm8Pg4CBEpAaPx4c71BBVlWphB0auU15eUS8mzTU3N1O9FLh85Sql5CLzYt++RnR3deHK1e9IVrtxpOcIVlZ1MFgssucytFiMnEgswbpzHbfm53Gs9yhGPhnG6OgwHOtOLOuW8e47b+P20h3Y7RZEIzHYLebEcwFtNstiKBRCJBxGX18fnARyl0AKWBYbwSBk+bLs1Xyrvx8Gown37ulIUq7VZwJSrUQkIyvVKq0sU1JX5dQYK7TaRXz/wzW0tLyI+r17YbPbwQgYtFBZSL8JknCwqqqqgiCEOwBJoDISZtButdzn04Cquhrd3a9hZHiYuloEl9uDAA2Jzo4O8jNXj4HJZFijN0eafRLIBfT5fHEaV06HwzExM/PtqkajeZoGl+YpNS/S6XTW1+v1/MTE+TWPx/OlUCh0h8PhRxTezL3L2/9Ktg45TBtPVldX1w4NDbXK6IpZLTYkucSmfmVVOD8/f4km0LW8vDwNZRag/WGy9I4B+4xVSvYyWX9OjNuS2jhZaMvn/jOx/8/1jwADAGAcA5mh2ubaAAAAAElFTkSuQmCC";

function renderSectionList() {
    var h = "";
    h += renderSectionListItem(TYPE_WEBFORMS, "Logins", logins_png);
    h += renderSectionListItem(TYPE_ACCOUNT, "Accounts", accounts_png);
    h += renderSectionListItem(TYPE_IDENTITIES, "Identities", identities_png);
    h += renderSectionListItem(TYPE_NOTES, "Secure Notes", secure_notes_png);
    h += renderSectionListItem(TYPE_SOFTWARE_LICENSES, "Software", software_png);
    h += renderSectionListItem(TYPE_WALLET, "Wallet", wallet_png);
    h += renderSectionListItem(TYPE_PASSWORDS, "Passwords", passwords_png);
    h += renderSectionListItem(TYPE_TRASHED, "Trash", trash_png);
    $('#sourcesPane').html(h);
}

function renderSectionListItem(name, displayName, img) {
    var r = "<li " + sectionOptions(name) + ">";
    r += "<img  src='" + img + "' alt='' />" + displayName;
    r += sectionCount(name, displayName);
    r += "</li>";
    return r;
}

function sectionOptions(name) {
    var opts = "id='" + name + "' onclick='selectSection(\"" + name + "\")'"

    if (selectedSection == name) {
        opts += " class='selected' "
    }
    return opts;
}

function sectionCount(name, display_name) {
    var result = " <span class='sectionCount'>(" + keychain.itemsOfType(name).length + ")</span>";
    return result;
}

function showAndHideConcealedField(id, clearText, concealed) {
    var revealHide = concealed ? "Reveal" : "Hide";

    // IMPL NOTE: Normally you need not escape HTML values in JS, but innerHTML assignment interprets the JS for some reason.
    // Note the use &apos instead of '. This is important as the interpreter gets confused when evaling innerHTML.
    var htmlValue = clearText.escapeHTML();
    var jsValue = htmlValue.replace(/\\/g, "\\\\");
    jsValue = jsValue.replace(/"/g, "\\\"").replace(/'/g, "&apos;");

    var r = "<table class='hideRevealButton' id='" + id + "'><tr><td><a class='copy'>";

    var copyImageId = "copyImage-" + id;
    r += copyableHiddenElement(copyImageId);
    r += "</a></td>";

    r += "<td><a class='revealButton' href='#' style='text-decoration:none' onclick='toggleVisibilityOfConcealedField(\"#" + copyImageId + "\", \"" + jsValue + "\", " + !concealed + ")'>" + revealHide + "</a></td>";

    r += "</tr>";
    r += "</table>";

    id = "#" + id;
    $(id).html(r);

    copyableEntries[copyImageId] = clearText;

    return r;
}

// TODO: Do not bother adding elements when running from file:// b/c of stupid default Flash security preference
function copyableHiddenElement(id) {
    return "<div style='position:relative'><div class='copy' id='" + id + "'>&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</div></div>";
}

function toggleVisibilityOfConcealedField(id, clearText) {
    if ($(id).text() == clearText) {
        $(id).html("&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;");
    } else {
        $(id).text(clearText);
    }
}

function enableCopyableEntries() {
    for (copyable in copyableEntries) {
        var clip = new ZeroClipboard.Client();
        clip.setHandCursor(true);
        clip.setText(copyableEntries[copyable]);

        var button = $(copyable);
        var container = button.parentNode;

        clip.glue(button, container);
    }
}

/*
function showPassword(data)
{
	if (data.notesPlain && data.notesPlain.length > 0) {

		$('#entryNotesDecryptedValue').parent().css('display', "");
	}
	
	var passwd = "<tr><td class='fieldName'>Password</td><td class='fieldValue'>" + data.password.escapeHTML() + "</td></tr>";
	$('#dynamicFields').html(passwd);
}
*/

function convertNewLines(txt) {
    return txt.replace(/\n\r/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, "<br />");
}

function sortCompareFunction(a, b) {
    if (current_sort_criteria == "Domain") {
        a = a.domain;
        b = b.domain;
    } else if (current_sort_criteria == "Modified") {
        a = a.updatedAtMs + "";
        b = b.updatedAtMs + "";
    } else {
        a = a.title;
        b = b.title;
    }

    var result = 0;
    if (a.toLowerCase() < b.toLowerCase()) {
        result = -1;
    } else if (a.toLowerCase() > b.toLowerCase()) {
        result = 1;
    }

    if (!current_sort_ascending) result = result * -1;

    return result;
}

function selectSection(section_id) {
    if (selectedFolder != "") {
        $("#" + selectedFolder).attr('class', '');
    }

    keychain.rescheduleAutoLogout();

    if (selectedSection != section_id) {
        selectedSection = section_id;
        renderSectionList();
        displayEntries({
            'select_first': true
        });
    }
}

function selectEntry(entry_id) {
    keychain.rescheduleAutoLogout();
    selectedEntryId = entry_id;

    // Deselect the currently highlighted entry
    $('#listPane .selected').removeClass('selected')

    $('#entry_' + entry_id).addClass('selected');
    var file = fullKeychainFilePath(entry_id + ".1password");
    loadFile(file, entryDidFinishLoading);
}

function entryDidFinishLoading(json) {
    if (!json || json == "") {
        alert("The data file for this entry could not be loaded.")
        return;
    }

    var entry;
    try {
        //entry = JSON.parse(json);
        entry = json;
    } catch (e) {
        alert('Error evaluating data for this entry! Error: ' + e);
    }

    selectedEntry = new KeychainItem(entry);
    showEntryDetails();
}

function displayEntries(opts) {
    var select_first = false;
    if (opts) {
        select_first = opts['select_first']
    }

    var all = keychain.itemsOfType(selectedSection);
    var entries = [];

    var s = $("#search").val().toLowerCase();

    for (var i = 0; i < all.length; ++i) {
        var e = all[i];
        if (e.matches(s)) entries.push(e);
    }

    entries.sort(sortCompareFunction);
    var i, len = entries.length;
    var displayCount = 0;
    var html = ""
    for (i = 0; i < len; ++i) {
        e = entries[i];

        displayCount++;
        var title = e.title;
        var domain = e.domain;
        var date = e.updatedAt;
        var uuid = e.uuid;
        var clazz = "";

        html += '<li id="entry_' + uuid + '" onclick="selectEntry(\'' + uuid + '\');"><strong>' + title.escapeHTML() + '</strong><br/>' + domain + '</li>';
    }
    $('#listPane').html(html);

    if (entries.length == 0) $('#detailsPane').text("");
    else if (select_first) selectEntry(entries[0].uuid);

    keychain.rescheduleAutoLogout();
}

function showEntryDetails() {
    keychain.rescheduleAutoLogout();
    $('#emptyDetailsPane').css("display", "none");
    $('#detailsPane').css("display", "");
    copyableEntries = {};

    concealedFieldCount = 0;

    var decryption_status;

    try {
        decryption_status = selectedEntry.decrypt()
    } catch (e) {
        alert("error " + e);
    }

    if (decryption_status != ERROR_OK) {
        alert("An error occurred while processing item '" + selectedEntry.uuid + "'.\n\n" + decryption_status);
        return;
    }

    $('#detailsPane').text("");

    var html = selectedEntry.asHTML();
    if (html) {
        $('#detailsPane').html(html);
    }

    // enableCopyableEntries();
}

function clearEntryDetails() {
    $('#listPane').text("");
    $('#sourcesPane').text("");
    $('#detailsPane').text("");
}

function searchEntries() {
    if (lastSearchString == $('#search').val()) return;

    displayEntries({
        'select_first': true
    });
    lastSearchString = $('#search').val();
}

var keychain;
var baseUrl;
var keychainFolder, dataFolder, styleFolder;
var current_profile = null;
var devmode;

var OPANYWHERE_VERSION = "001";

function mainPageDidFinishLoading() {
    try {
        setup();
        keychain = new Keychain();
        showLockedScreen();
    } catch (e) {
        showFatalException(e);
    }
}

function showLockedScreen() {
    try {
        $("#mainBody").html($("#login-html").html());

        // Todo: allProfiles should be dynamically loaded
        var allProfiles = ["default"];
        selectProfile(allProfiles[0]);
        $("#masterPassword").focus();
    } catch (e) {
        showFatalException(e);
    }
}

function verifyPassword(password) {
    try {
        if (!keychain.encryptionKeysLoaded) {
            encryptionKeysCouldNotLoad();
            return;
        }
        if (keychain.verifyPassword(password)) {
            $("#mainBody").html($("#main-html").html());
            loadFile(
                fullKeychainFilePath('contents.js'),
                profileContentsDidFinishLoading
            );
        } else {
            login_failed();
        }
    } catch (e) {
        showFatalException(e);
    }
}


function encryptionKeysCouldNotLoad() {
    if (document.location.href.match(/file:.*var\/mobile.*\/Dropbox/i)) {
        showFatalMessage("1PasswordAnywhere cannot run in the Dropbox app", "<p>To access your data on iOS, please use Mobile Safari or <a href='itms-apps://itunes.apple.com/us/app/1password-pro/id319898689'>1Password app from the App Store</a>.</p>");
    } else if (document.location.href.match(/file:.*mnt.*\/dropbox/i)) {
        showFatalMessage("1PasswordAnywhere cannot run in the Dropbox app", "<p>To access your data in Android OS, please visit dropbox.com in your web browser or use <a href='https://market.android.com/details?id=com.onepassword.passwordmanager'>1Password for Android</a>.</p>");
    } else {
        var keysFilePath = fullKeychainFilePath('encryptionKeys.js');
        showFatalMessage("Problem loading 1Password data file", "<p>A <a target='_blank' href='" + keysFilePath + "'>key data file</a> could not be loaded and 1PasswordAnywhere cannot continue without it.</p><p>Please see <a target='_blank'  href='http://help.agilebits.com/1Password3/1passwordanywhere_troubleshooting.html'>this help guide</a> for troubleshooting tips.</p>");
    }
}

function encryptionKeysDidFinishLoading(json) {
    if (!json || json == "") {
        encryptionKeysCouldNotLoad();
        return;
    }

    try {
        var keys;
        try {
            if(!mainVaultPath){
                json = "(" + json + ")";
            }
            keys = eval(json);
        } catch (e) {
            showFatalMessage("Problem parsing 1Password data file", "<p>There was a problem parsing the data contained in encryptionKeys.js.</p><p>Please <a href='mailto:1PAnywhere@agilebits.com?subject=1PasswordAnywhere%20problem%20parsing%20encryptionKeys.js&body=Please let us know what you were doing when this problem occurred.'>report this problem</a> to the Agile team.</p>")
        }

        keychain.setEncryptionKeys(keys);
    } catch (e) {
        showFatalException(e);
    }
}

function selectProfile(profile_name) {
    try {
        top.current_profile = profile_name;
        loadFile(fullKeychainFilePath('encryptionKeys.js'), encryptionKeysDidFinishLoading);
    } catch (e) {
        showFatalException(e);
    }
}

function setup() {
    try {
        _setup();
    } catch (e) {
        showFatalException(e);
    }
}

function _setup() {
    baseUrl = window.location.href.substring(0, window.location.href.indexOf("1Password.html"));
    if(mainVaultPath){
        keychainFolder = mainVaultPath;
    }
    else{
        keychainFolder = baseUrl;
    }

    var parameters = window.location.search.substring(1).split("&");

    for (var i = 0; i < parameters.length; i++) {
        var nvp = parameters[i].split("=");
        var name = nvp[0],
            value = nvp[1];

        if (name == "keychainFolder") {
            keychainFolder = value;
            if (keychainFolder[keychainFolder.length - 1] != "/") keychainFolder += "/";
        }
        if (name == "keychainFolder" && navigator && navigator.userAgent.match("Firefox")) {
            alert("FATAL: The keychainFolder parameter is NOT supported in Firefox. Accessing files from outside the folder that opens you is against the mozilla security model unless you set security.fileuri.strict_origin_policy to false.");
        }
        if (name == "devmode") {
            devmode = true;
        }
    }

    if (devmode) {
        styleFolder = "./style";
    } else {
        styleFolder = keychainFolder + "/style";
    }
    dataFolder = keychainFolder + "/data";
}

function logout(autologout) {
    try {
        // Not really needed but want to be 100% sure decrypted data is cleared
        clearEntryDetails();
        keychain.lock();

        // TODO -- would be nice to show autologout message to user
        showLockedScreen();
    } catch (e) {
        showFatalException(e);
    }
}

function setFocus() {
    $('#password').focus();
}

function fullKeychainFilePath(filename) {
    if(mainVaultPath){
        var profile = "default";
        if(top.current_profile){
            profile = top.current_profile;
        }
        return mainVaultPath + "data/" + profile + "/" + filename;
    }
    else{
        return top.keychainFolder + "data/" + top.current_profile + "/" + filename;
    }
}

function fileread(filename){
    return fs.readFileSync(filename);
}

function loadFile(file, onSuccess) {
    if(mainVaultPath){
        //load file from local
        var filePath = path.join(file);
        var data = fileread(filePath);
        obj = JSON.parse(data);
        onSuccess(obj);
    }
    else{
        alert('A problem occurred when loading the "' + file + '" file.');
        /*$.ajax({
            url: file,
            success: function(data, textStatus, request) {
                onSuccess(request.responseText);
            },
            error: function() {
                alert('A problem occurred when loading the "' + file + '" file.');
            },
        });
        */
    }
}

function enableFirefoxPrivileges() {
    // request local file read permission in Firefox
    try {
        try {
            // Make Safari bomb out
            netscape;
            netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");
        } catch (e) {}
    } catch (e) {
        alert("Permission to read file was denied. If in Firefox you must allow this script to load local files.");
    }
}

function showFatalException(exc) {
    if(exc){
        alert("Exception: \r\n"+exc);
    }
    else{
        alert("Unknown exception");
    }
    /*
    try {
        window.console && console.log && console.log("Exception: " + exc ? exc : "N/A");

        var error_desc = "EXCEPTION WAS NIL."
        if (exc) {
            var file = exc.sourceURL;
            if (!file) file = exc.fileName;
            if (file && file.match(/^.*\/(.*)\?ts=.*$/)) {
                file = RegExp.$1;
            }
            error_desc = exc.name + " occurred in " + file + " on line #" + exc.line + ":\n" + exc.message;
        }

        if (OPANYWHERE_VERSION) error_desc += "\nYou are running 1PasswordAnywhere version #" + OPANYWHERE_VERSION;

        var html_msg = "<p>" + error_desc.replace(/\n/g, "<br/>") + "</p><p>Please <a href='mailto:1PAnywhere@agilebits.com?subject=1PasswordAnywhere%20Problem&body=Please let us know what you were doing when this problem occurred.%0A%0AError details:%0A" + escape(error_desc) + "'>report this error</a> so Agile can investigate.</p>";
        _showMessageBox("1PasswordAnywhere experienced an error", html_msg, 'messageBox_error', {
            'fatal': true
        });
    } catch (e) {
        window.console && console.log && console.log("Exception during error processing: " + e ? e : "N/A");

        var msg = 'An exception occurred during error processing! Please report this issue to Agile at 1PAnywhere@agilebits.com along with a description of what you were doing when this error happened.';
        if (OPANYWHERE_VERSION) msg += ' You are running version #' + OPANYWHERE_VERSION;
        alert(msg);
    }
    */
}

function showMessage(title, message) {
    _showMessageBox(title, message, 'messageBox_error', {});
}

function showFatalMessage(title, message) {
    _showMessageBox(title, message, 'messageBox_error', {
        'fatal': true
    });
}

function showFatalMessageWithEmailSupportLink(title, message) {
    if (OPANYWHERE_VERSION) message += "\nYou are running 1PasswordAnywhere version #" + OPANYWHERE_VERSION;

    var html_msg = "<p>" + message.gsub(/\n/, "<br/>") + "</p><p>Please <a href='mailto:1PAnywhere@agilebits.com?subject=1PasswordAnywhere%20Problem&body=Please let us know what you were doing when this problem occurred.%0A%0AError details:%0A" + escape(message) + "'>report this error</a> so Agile can investigate.</p>";

    _showMessageBox("1PasswordAnywhere experienced an error", html_msg, 'messageBox_error', {
        'fatal': true
    });
}

function _showMessageBox(title, message, cssClass, options) {
    var help_url = options['help_url'];
    if (help_url) {
        $("#messageBox_help").attr('href', help_url);
    } else {
        $("#messageBox_help").hide();
    }

    $('#messageBox').addClass(cssClass);
    $('#messageBox_title').html(title);
    $('#messageBox_message').html(message);

    // Effect.Appear
    $('#messageBox_wrapper').show();
    $('#messageBox').fadeIn();

    var fatal = options['fatal'];
    if (fatal) {
        $("#messageBox_dismiss").hide();
    } else {
        $('#messageBox_dismiss').click(function() {
            //Dismiss message box.
            $('#messageBox_wrapper').fadeOut();
            $('#messageBox').fadeOut();

            $('messageBox_dismiss').unbind('click');
        });

        $('#messageBox_wrapper').click(function() {
            //Dismiss message box.
            $('#messageBox_wrapper').fadeOut();
            $('#messageBox').fadeOut();

            $('#messageBox_dismiss').unbind('click');
        });
    }
}

function login_failed() {
    try {
        $('#passwordLabel').addClass('error');
        $('#masterPassword').addClass('error');
        $('#masterPassword').val("");

        var hint = fullKeychainFilePath(".password.hint");
        $.ajax({
            url: hint,
            success: function(data, textStatus, request) {
                showPasswordHintIfAvailable(data)
            }
        });

        // TODO 
        //  Effect.Shake('passwordLabel');
    } catch (e) {
        showFatalException(e);
    }
}

function showPasswordHintIfAvailable(hint) {
    $('#passwordError').css('display', '');
    //  if (transport.status != 404 && transport.responseText.length != 0) {
    if (hint) {
        $('#masterPasswordHint').html(hint);
    }
}