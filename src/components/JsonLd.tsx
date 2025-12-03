export default function JsonLd({ data }: { data: Record<string, any> }) {
  const json = JSON.stringify(data);
  return (
    <script
      key="json-ld"
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
