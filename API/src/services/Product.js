import Product from "../models/Product";
import User from '../models/User';
import {join} from 'path';

import {
    validateId,
    validateImg,
    validateSimpleText,
    validatePrice,
    validateCuantity
} from '../util/validators';
import {asignError, deleteUploadFiles, usernameInMongoose, renameFile, deleteFile, existAllErrors} from '../util/functionals';
import {extractNumberInText, firstUpper, extractExt, regexSearch, firstCharName, sanitizeString, ssre, cleanSpaces} from '../util/formats';

