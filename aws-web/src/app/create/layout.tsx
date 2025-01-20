export default function Layout(props: { children: React.ReactNode }) {
  return (
    <form>
        <h2>Create</h2>
        {props.children}
    </form>
  );
}