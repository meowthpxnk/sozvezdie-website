interface ValidationError {
    loc: string[];
    msg: string;
    type: string;
}

interface ErrorResponse {
    detail: ValidationError[];
}

export function parse422(errorResponse: ErrorResponse) {
    if (errorResponse?.detail) {
        return errorResponse.detail.map((error) => {
            const message = error.msg;
            const loc = error.loc.join(" -> ");
            return `Error in ${loc}: ${message}`;
        });
    }
    return ["Unknown error occurred"];
}
