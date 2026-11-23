import { HttpErrorResponse } from '@angular/common/http';

const TECHNICAL_ERROR_PATTERNS = [
  /failed to fetch/i,
  /http failure response/i,
  /network\s?error/i,
  /unknown error/i,
  /load failed/i,
  /connection refused/i,
  /net::err/i,
];

/**
 * فحص ما إذا كانت الرسالة عبارة عن نص خطأ تقني إنجليزي صادر من المتصفح
 */
export function isTechnicalError(msg: string): boolean {
  if (!msg) {
    return false;
  }
  return TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(msg));
}

/**
 * دالة مركزية لاستخلاص رسائل الخطأ من استجابات الـ API والـ HTTP
 * تمنع ظهور الرسائل الإنجليزية التقنية (مثل Failed to fetch) وتعيد رسائل عربية واضحة ومفهومة.
 */
export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (!err) {
    return fallback;
  }

  // حالة تعذر الاتصال بالخادم (Status: 0 أو TypeError من المتصفح)
  if (err instanceof HttpErrorResponse || (typeof err === 'object' && 'status' in (err as any))) {
    const httpErr = err as HttpErrorResponse;
    if (httpErr.status === 0) {
      return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والتأكد من تشغيل الخادم.';
    }
  }

  const errorObj = err as Record<string, unknown>;

  // 1. فحص err.error إذا كان نصاً مباشراً
  const rawError = errorObj?.['error'];
  if (typeof rawError === 'string' && rawError.trim().length > 0) {
    const trimmed = rawError.trim();
    if (!isTechnicalError(trimmed)) {
      return trimmed;
    }
    return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والتأكد من تشغيل الخادم.';
  }

  // 2. فحص err.error.message و err.error.title
  if (typeof rawError === 'object' && rawError !== null) {
    const errorPayload = rawError as Record<string, unknown>;

    if (
      typeof errorPayload['message'] === 'string' &&
      errorPayload['message'].trim().length > 0
    ) {
      const msg = errorPayload['message'].trim();
      if (!isTechnicalError(msg)) {
        return msg;
      }
      return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والتأكد من تشغيل الخادم.';
    }

    if (
      typeof errorPayload['title'] === 'string' &&
      errorPayload['title'].trim().length > 0
    ) {
      const title = errorPayload['title'].trim();
      if (!isTechnicalError(title)) {
        return title;
      }
      return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والتأكد من تشغيل الخادم.';
    }
  }

  // 3. فحص err.message العامة
  if (typeof errorObj?.['message'] === 'string' && errorObj['message'].trim().length > 0) {
    const msg = errorObj['message'].trim();
    if (isTechnicalError(msg)) {
      return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والتأكد من تشغيل الخادم.';
    }
    return msg;
  }

  return fallback;
}
