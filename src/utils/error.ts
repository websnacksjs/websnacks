export const isErrnoException = (
	error: Error,
): error is NodeJS.ErrnoException => "code" in error;
