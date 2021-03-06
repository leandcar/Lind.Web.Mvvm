﻿var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ViewModels;
(function (ViewModels) {
    /// <reference path="../../typings/knockout/knockout.d.ts" />
    /// <reference path="../../typings/async/async.d.ts" />
    /// <reference path="../../typings/jquery/jquery.d.ts" />
    (function (Navigation) {
        (function (NavigationItemStatus) {
            NavigationItemStatus[NavigationItemStatus["Loading"] = 0] = "Loading";
            NavigationItemStatus[NavigationItemStatus["Loaded"] = 1] = "Loaded";
            NavigationItemStatus[NavigationItemStatus["Unloading"] = 2] = "Unloading";
            NavigationItemStatus[NavigationItemStatus["Unloaded"] = 3] = "Unloaded";
        })(Navigation.NavigationItemStatus || (Navigation.NavigationItemStatus = {}));
        var NavigationItemStatus = Navigation.NavigationItemStatus;
        var NavigationData = (function () {
            function NavigationData(Name, DisplayName, IsCloseable) {
                this.Name = Name;
                this.DisplayName = DisplayName;
                this.IsCloseable = IsCloseable;
                this.name = ko.observable(Name);
                this.name.subscribe(function (n) {
                    return Name = n;
                });
                this.displayName = ko.observable(DisplayName);
                this.displayName.subscribe(function (n) {
                    return DisplayName = n;
                });
                this.isCloseable = ko.observable(IsCloseable);
                this.isCloseable.subscribe(function (n) {
                    return IsCloseable = n;
                });
            }
            return NavigationData;
        })();
        Navigation.NavigationData = NavigationData;
        var NavigationItemFactory = (function () {
            function NavigationItemFactory() {
            }
            NavigationItemFactory.Create = function (data) {
                if (this.FactoryMethod != null)
                    return this.FactoryMethod(data);
                return null;
            };
            NavigationItemFactory.Initalize = function (factoryMethod) {
                this.FactoryMethod = factoryMethod;
            };
            return NavigationItemFactory;
        })();
        Navigation.NavigationItemFactory = NavigationItemFactory;
        var NavigationItem = (function () {
            function NavigationItem(Data) {
                var _this = this;
                this.Data = Data;
                this.closed = new Lind.Events.TypedEvent();
                this.navigationItemAdded = new Lind.Events.TypedEvent();
                this.queue = async.queue(function (s, c) {
                    if (s)
                        _this.loadWorker().then(function () {
                            return c();
                        }, function () {
                            return c();
                        });
                    else
                        _this.unloadWorker().then(function () {
                            return c();
                        }, function () {
                            return c();
                        });
                }, 1);
                this.data = ko.observable(Data);
                this.data.subscribe(function (n) {
                    return Data = n;
                });
                this.status = ko.observable(3 /* Unloaded */);
                this.isLoading = ko.computed(function () {
                    return _this.status() == 0 /* Loading */;
                });
                this.isLoaded = ko.computed(function () {
                    return _this.status() == 1 /* Loaded */;
                });
                this.isUnloaded = ko.computed(function () {
                    return _this.status() == 3 /* Unloaded */;
                });
                this.isUnloading = ko.computed(function () {
                    return _this.status() == 2 /* Unloading */;
                });
            }
            NavigationItem.prototype.load = function () {
                var d = $.Deferred();
                this.queue.push(true, function () {
                    return d.resolve(true);
                });
                return d.promise();
            };
            NavigationItem.prototype.unload = function () {
                var d = $.Deferred();
                this.queue.push(false, function () {
                    return d.resolve(true);
                });
                return d.promise();
            };
            NavigationItem.prototype.unloadWorker = function () {
                var _this = this;
                var d = $.Deferred();
                this.doUnload().then(function (s) {
                    return _this.onUnloaded(s, d);
                }, function () {
                    return _this.onLoaded(false, d);
                });
                this.onUnloading();
                return d.promise();
            };
            NavigationItem.prototype.loadWorker = function () {
                var _this = this;
                var d = $.Deferred();
                if (this.isLoaded()) {
                    this.unload();
                    this.load();
                    d.resolve(false);
                } else {
                    this.doLoad().then(function (s) {
                        return _this.onLoaded(s, d);
                    }, function () {
                        return _this.onLoaded(false, d);
                    });
                    this.onLoading();
                }
                return d.promise();
            };
            NavigationItem.prototype.onLoaded = function (loadStatus, promise) {
                this.status(1 /* Loaded */);
                promise.resolve(loadStatus);
            };
            NavigationItem.prototype.onUnloaded = function (unloadStatus, promise) {
                this.status(3 /* Unloaded */);
                promise.resolve(unloadStatus);
            };
            NavigationItem.prototype.onLoading = function () {
                this.status(0 /* Loading */);
            };
            NavigationItem.prototype.onUnloading = function () {
                this.status(2 /* Unloading */);
            };
            NavigationItem.prototype.doLoad = function () {
                var d = $.Deferred();
                d.resolve(true);
                return d.promise();
            };
            NavigationItem.prototype.doUnload = function () {
                var d = $.Deferred();
                d.resolve(true);
                return d.promise();
            };
            NavigationItem.prototype.close = function () {
                if (this.status() != 3 /* Unloaded */)
                    this.unload();
                this.closed.trigger(this);
            };
            NavigationItem.prototype.addNavigationItem = function (navigationItem) {
                this.navigationItemAdded.trigger(navigationItem);
            };
            return NavigationItem;
        })();
        Navigation.NavigationItem = NavigationItem;
        var NavigationItemCollection = (function (_super) {
            __extends(NavigationItemCollection, _super);
            function NavigationItemCollection(data) {
                _super.call(this, data);
                this.items = ko.observableArray();
            }
            NavigationItemCollection.prototype.doLoad = function () {
                var _this = this;
                return this.getItems().then(function (i) {
                    if (i != null) {
                        for (var k = 0; k < i.length; k++) {
                            _this.items.push(i[k]);
                        }
                    }
                }, function () {
                    return;
                }).then(function () {
                    return true;
                }, function () {
                    return false;
                });
            };
            NavigationItemCollection.prototype.doUnload = function () {
                var _this = this;
                return _super.prototype.doUnload.call(this).then(function () {
                    return _this.items.removeAll();
                }, function () {
                    return _this.items.removeAll();
                }).then(function () {
                    return true;
                }, function () {
                    return false;
                });
            };
            NavigationItemCollection.prototype.getItems = function () {
                var d = $.Deferred();
                d.resolve(null);
                return d.promise();
            };
            return NavigationItemCollection;
        })(NavigationItem);
        Navigation.NavigationItemCollection = NavigationItemCollection;
    })(ViewModels.Navigation || (ViewModels.Navigation = {}));
    var Navigation = ViewModels.Navigation;
})(ViewModels || (ViewModels = {}));
