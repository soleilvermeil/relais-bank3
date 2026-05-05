type Props = { example: string; id?: string };

/** Short hint under an input so learners know what format is expected. */
export function FieldHint({ example, id }: Props) {
  return (
    <p
      id={id}
      className="mt-1 text-xs leading-relaxed text-muted-foreground"
    >
      <span className="font-medium text-foreground/80">Example: </span>
      {example}
    </p>
  );
}
