import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { GiReceiveMoney } from 'react-icons/gi';
import { GrGroup } from 'react-icons/gr';
import { useIcon } from '../../utils/react-utils';
import { isOffline } from '../../utils';
import ChargeActionSheet from '../../actionsheets/Charge';
import { ActionSheetContext } from '../../contexts/ActionSheetContext';

export default function UnlockedFooter() {
	const { setActiveSheet, showLoading } = useContext(ActionSheetContext);
	//const [showChargeAction, setShowChargeAction] = useState(false);

	//const handleChargeActionToggle = () => setShowChargeAction(!showChargeAction);

	return (
		<>
			<ChargeActionSheet />

			<div className="footer-unlocked">
				<div className="appBottomMenu">
					<Link to="/beneficiary" className="item">
						<div className="col">
							<GrGroup className="ion-icon" />
							<strong>Beneficiaries</strong>
						</div>
					</Link>
					<a
						href="#home"
						className="item"
						onClick={() => {
							if (isOffline()) return;
							setActiveSheet('qrcode-reader');
						}}
					>
						<div className="col">
							<div className="action-button large">
								<GiReceiveMoney className="ion-icon" />
							</div>
						</div>
					</a>
					<Link to="/settings" className="item">
						<div className="col">
							{useIcon('IoSettingsOutline')}
							<strong>Settings</strong>
						</div>
					</Link>
				</div>
			</div>
		</>
	);
}
