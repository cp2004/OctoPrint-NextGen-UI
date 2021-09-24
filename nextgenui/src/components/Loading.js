import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

export default function Loading (props) {
    return (
        <>
            <LinearProgress color={props.color}/>
            <Container maxWidth={"md"} sx={{pt: 20}}>
                <Typography variant={"h3"} component={"h1"} align={"center"}>
                    {props.children}
                </Typography>
            </Container>
        </>
    )
}
