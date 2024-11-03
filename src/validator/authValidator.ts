import { body } from "express-validator";

const MIN_USERNME_LEN = 4;
const MAX_USERNAME_LEN = 255;
const MIN_PASSWORD_LEN = 8;
const MAX_PASSWORD_LEN = 16;

const signUpErrors = {
    length: {
        username: `Username must be in between range ${MIN_USERNME_LEN} to ${MAX_USERNAME_LEN}`,
        password: `Password must be at least ${MIN_PASSWORD_LEN} character long`,
    },
    format: {},
    other: {
        email: "Must be valid email",
    },
};

const emailValidator = () => {
    return body("email").trim().isEmail().withMessage(signUpErrors.other.email);
};

const passwordValidator = () => {
    return body("password")
        .trim()
        .isLength({ min: MIN_PASSWORD_LEN, max: MAX_PASSWORD_LEN })
        .withMessage("Password must be at least 8 character long");
};

export const SignUpPostValidator = [
    body("username")
        .trim()
        .isLength({ min: MIN_USERNME_LEN, max: MAX_USERNAME_LEN })
        .withMessage(signUpErrors.length.username),
    emailValidator(),
    passwordValidator(),
];

export const SignInValidator = [emailValidator(), passwordValidator()];
