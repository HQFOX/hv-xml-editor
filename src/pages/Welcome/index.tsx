import { css } from "@emotion/css";
import { theme } from "@hitachivantara/uikit-react-core";
import XmlEditor from "./XmlEditor";

const classes = {
	root: css({
		height: "100%",
		padding: theme.space.xl,
	}),
};

const Welcome = () => {
	return (
		<div className={classes.root}>
			<XmlEditor />
		</div>
	);
};

export default Welcome;
