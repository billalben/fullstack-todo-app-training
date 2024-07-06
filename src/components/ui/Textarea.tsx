import { forwardRef, TextareaHTMLAttributes } from "react";

interface IProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, IProps>((props, ref) => {
  return (
    <textarea
      ref={ref}
      className="border-[1px] border-gray-300 shadow-md focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-lg px-3 py-3 text-md w-full bg-transparent"
      rows={6}
      {...props}
    />
  );
});

export default Textarea;
