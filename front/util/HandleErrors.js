const HandleErrors = /** @class */ (function () {
    function HandleErrors(name, error) {
        this.errors = {};
        if (name && error) {
            this.set(name, error);
        }
        else if (name) {
            throw 'If you define "name" parameter, you need to define "name" parameter!';
        }
        else if (error) {
            throw 'If you define "error" parameter, you need to define "name" parameter!';
        }
    }
    HandleErrors.prototype.set = function (name, error) {
        if (!error && (name in this.errors)) {
            delete this.errors[name];
        }
        else if (!!error) {
            this.errors[name] = error;
        }
    };
    HandleErrors.prototype.getErrors = function () {
        if (Object.keys(this.errors).length > 0)
            return this.errors;
        return null;
    };
    HandleErrors.prototype.getArrayErrors = function () {
        var arrayErrors = [];
        for (var name in this.errors) {
            arrayErrors.push(this.errors[name]);
        }
        return arrayErrors;
    };
    HandleErrors.prototype.deleteError = function () {
        var _this = this;
        var names = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            names[_i] = arguments[_i];
        }
        names.forEach(function (name) {
            if (name in _this.errors)
                delete _this.errors[name];
        });
    };
    HandleErrors.prototype.reset = function () {
        this.errors = {};
    };
    return HandleErrors;
}());

export default HandleErrors;