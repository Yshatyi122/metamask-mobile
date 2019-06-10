import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View, Text, StyleSheet } from 'react-native';
import Coachmark from '../Coachmark';
import setOnboardingWizardStep from '../../../../actions/wizard';
import { strings } from '../../../../../locales/i18n';
import onboardingStyles from './../styles';

const INDICATOR_HEIGHT = 10;
const styles = StyleSheet.create({
	main: {
		flex: 1
	},
	some: {
		marginHorizontal: 45
	},
	coachmarkContainer: {
		flex: 1,
		position: 'absolute',
		left: 0,
		right: 0
	}
});

class Step2 extends Component {
	static propTypes = {
		/**
		 * Dispatch set onboarding wizard step
		 */
		setOnboardingWizardStep: PropTypes.func,
		/**
		 * Coachmark ref to get position
		 */
		coachmarkRef: PropTypes.object
	};

	state = {
		coachmarkTop: 0
	};

	componentDidMount = () => {
		this.getPosition(this.props.coachmarkRef.mainView);
	};

	/**
	 * If component ref defined, calculate its position and position coachmark accordingly
	 */
	getPosition = ref => {
		ref &&
			ref.current &&
			ref.current.measure((fx, fy, width, height, px, py) => {
				this.setState({ coachmarkTop: py + height - INDICATOR_HEIGHT });
			});
	};

	/**
	 * Dispatches 'setOnboardingWizardStep' with next step
	 */
	onNext = () => {
		const { setOnboardingWizardStep } = this.props;
		setOnboardingWizardStep && setOnboardingWizardStep(3);
	};

	/**
	 * Dispatches 'setOnboardingWizardStep' with back step
	 */
	onBack = () => {
		const { setOnboardingWizardStep } = this.props;
		setOnboardingWizardStep && setOnboardingWizardStep(1);
	};

	/**
	 * Returns content for this step
	 */
	content = () => (
		<View style={onboardingStyles.contentContainer}>
			<Text style={onboardingStyles.content}>{strings('onboarding_wizard.step2.content1')}</Text>
			<Text style={onboardingStyles.content}>{strings('onboarding_wizard.step2.content2')}</Text>
		</View>
	);

	render() {
		return (
			<View style={styles.main}>
				<View style={[styles.coachmarkContainer, { top: this.state.coachmarkTop }]}>
					<Coachmark
						title={strings('onboarding_wizard.step2.title')}
						content={this.content()}
						onNext={this.onNext}
						onBack={this.onBack}
						style={styles.some}
						topIndicatorPosition={'topCenter'}
						currentStep={1}
					/>
				</View>
			</View>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	setOnboardingWizardStep: step => dispatch(setOnboardingWizardStep(step))
});

export default connect(
	null,
	mapDispatchToProps
)(Step2);
