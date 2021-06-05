import Container from "@material-ui/core/Container";
import {LinearProgress} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

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
