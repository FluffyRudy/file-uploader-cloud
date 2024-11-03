export const formatValidationErrors = (errors: Array<any>) => {
    return errors.reduce((acc, error) => {
        acc[error.path] = error.msg;
        return acc;
    }, {});
};

