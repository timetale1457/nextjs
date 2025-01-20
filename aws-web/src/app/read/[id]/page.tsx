interface ReadProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function Read(props: ReadProps) {
    const { id } = await props.params;
    return (
        <>
            <h2>Read</h2>
            { id }
        </>
    );
}