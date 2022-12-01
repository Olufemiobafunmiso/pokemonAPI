type Data = unknown;

abstract class BaseResponseObject {
  constructor(
    public success: boolean,
    public message: string,
    public data: Data = null
  ) {}
}

export class SuccessResponseObject extends BaseResponseObject {
  constructor(public message: string, public data: Data = null) {
    super(true, message, data);
  }
}

export class ErrorResponseObject extends BaseResponseObject {
  constructor(public message: string, public data: Data = null) {
    super(false, message, data);
  }
}
