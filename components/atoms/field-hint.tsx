type Props = { hint: string; id?: string };

/** Short hint under an input so learners know what format is expected. */
export function FieldHint({ hint, id }: Props) {
  return (
    <p
      id={id}
      className="mt-1 text-xs leading-relaxed text-muted-foreground"
    >
      {hint}
    </p>
  );
}
