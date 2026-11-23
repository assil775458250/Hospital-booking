import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * معترض أخطاء HTTP المركزي
 * يعترض الأخطاء على مستوى الشبكة والخادم ويحول الرسائل التقنية الإنجليزية (مثل Failed to fetch)
 * إلى رسائل عربية واضحة ومفهومة للمستخدم.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        let arabicMessage = '';

        // حالة انقطاع الاتصال أو فشل الوصول للخادم (Status 0 / Failed to fetch)
        if (
          error.status === 0 ||
          error.message?.toLowerCase().includes('failed to fetch') ||
          error.statusText?.toLowerCase().includes('unknown error')
        ) {
          arabicMessage =
            'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والتأكد من تشغيل الخادم.';
        } else if (error.status === 403) {
          arabicMessage = 'ليس لديك الصلاحية الكافية لتنفيذ هذا الإجراء.';
        } else if (error.status === 404 && !error.error?.message) {
          arabicMessage = 'المورد أو الخدمة المطلوبة غير موجودة.';
        } else if (error.status >= 500 && !error.error?.message) {
          arabicMessage =
            'حدث خطأ غير متوقع في الخادم. يرجى المحاولة مرة أخرى لاحقاً.';
        }

        if (arabicMessage) {
          // استنساخ كائن الخطأ مع إرفاق الرسالة العربية في البايلود
          const modifiedError = new HttpErrorResponse({
            error: {
              ...(typeof error.error === 'object' && error.error !== null
                ? error.error
                : {}),
              message: arabicMessage,
            },
            headers: error.headers,
            status: error.status,
            statusText: error.statusText,
            url: error.url || undefined,
          });

          return throwError(() => modifiedError);
        }
      }

      return throwError(() => error);
    })
  );
};
