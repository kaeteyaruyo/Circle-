class ApiTrait {
    public returnError(code = 403, message = "", data = {}): any {
        return {
            "status": code,
            "message": message,
            "data": data
        }
    }
}

export{ ApiTrait }