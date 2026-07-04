export default function LoadingProgressBar() {
  return (
    <div
      className="w-48 h-1 rounded-full overflow-hidden bg-fp-border"
      aria-hidden="true"
    >
      <div className="h-full w-1/3 rounded-full bg-fp-orange loading-progress-indeterminate" />
    </div>
  );
}
