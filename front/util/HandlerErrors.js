class HandlerErrors {
    constructor(name, error) {
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
    set(name, error) {
        if (!error && (name in this.errors)) {
            delete this.errors[name];
        }
        else if (!!error) {
            this.errors[name] = error;
        }
    }
    get(error) {
        var _a;
        return (_a = this.errors[error]) !== null && _a !== void 0 ? _a : null;
    }
    getErrors() {
        if (Object.keys(this.errors).length > 0)
            return this.errors;
        return null;
    }
    getArrayErrors() {
        let arrayErrors = [];
        for (let name in this.errors) {
            arrayErrors.push(this.errors[name]);
        }
        return arrayErrors;
    }
    existsErrors() {
        return (Object.keys(this.errors).length > 0);
    }
    existsSome(...errors) {
        return errors.some(err => !!this.errors[err]);
    }
    exists(error) {
        return !!this.errors[error];
    }
    merege(errors) {
        let newErrors = (!('existsErrors' in errors)) ? errors : errors.getErrors();
        if (!newErrors)
            return;
        this.errors = Object.assign(Object.assign({}, this.errors), newErrors);
    }
    pushErrorInArray(name, error, includeNulls) {
        if (!includeNulls && (error === undefined || error === null))
            return;
        if (!this.exists(name))
            this.errors[name] = [];
        this.errors[name].push(error !== null && error !== void 0 ? error : null);
    }
    deleteError(...names) {
        names.forEach(name => {
            if (name in this.errors)
                delete this.errors[name];
        });
    }
    reset() {
        this.errors = {};
    }
}
export default HandlerErrors;