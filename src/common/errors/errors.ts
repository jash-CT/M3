import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessError extends HttpException {
  constructor(
    message: string,
    public readonly code: string,
    status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super({ message, code }, status);
  }
}

export class InsufficientFundsError extends BusinessError {
  constructor(message = 'Insufficient funds') {
    super(message, 'INSUFFICIENT_FUNDS', HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

export class KYCRequiredError extends BusinessError {
  constructor(message = 'KYC verification required') {
    super(message, 'KYC_REQUIRED', HttpStatus.FORBIDDEN);
  }
}

export class AMLBlockedError extends BusinessError {
  constructor(message = 'Transaction blocked by AML policy') {
    super(message, 'AML_BLOCKED', HttpStatus.FORBIDDEN);
  }
}

export class FraudBlockedError extends BusinessError {
  constructor(message = 'Transaction blocked by fraud rules') {
    super(message, 'FRAUD_BLOCKED', HttpStatus.FORBIDDEN);
  }
}

export class PartnerGatewayError extends HttpException {
  constructor(
    message: string,
    public readonly partnerCode: string,
    status: HttpStatus = HttpStatus.BAD_GATEWAY,
  ) {
    super({ message, partnerCode: partnerCode }, status);
  }
}

export class IdempotencyConflictError extends HttpException {
  constructor(statusCode: number, body: unknown) {
    super(
      { message: 'Idempotency conflict', statusCode, body },
      HttpStatus.CONFLICT,
    );
  }
}
