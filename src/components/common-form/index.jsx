import { Button } from "../ui/button";
import FormControls from "./form-controls";

function CommonForm({
  handleSubmit,
  buttonText,
  formControls = [],
  formData,
  setFormData,
  isButtonDisabled = false,
}) {
  return (
    <form onSubmit={handleSubmit}>
      {/* render form controls here */}
      <FormControls
        formControls={formControls}
        formData={formData}
        setFormData={setFormData}
      />
      <Button
        disabled={isButtonDisabled}
        type="submit"
        className="mt-5 w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none"
      >
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;
