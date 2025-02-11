import React, { useState, useContext, useRef, useEffect } from 'react';
import { useHistory, Redirect } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { useResize } from '../../utils/react-utils';
import { isOffline } from '../../utils';
import { AppContext } from '../../contexts/AppContext';
import TransactionList from '../transactions/list';
import DataService from '../../services/db';
import { TokenService } from '../../services/chain';
import Loading from '../global/Loading';

var QRCode = require('qrcode.react');

export default function Main() {
	const history = useHistory();
	const { hasWallet, wallet, tokenBalance, recentTx, setTokenBalance, addRecentTx, agency } = useContext(AppContext);
	const [showPageLoader, setShowPageLoader] = useState(true);
	const [loading, showLoading] = useState(null);

	const cardBody = useRef();
	const { width } = useResize(cardBody);

	const calcQRWidth = () => {
		if (width < 200) return 200;
		else return 280;
	};

	const checkVendorStatus = async () => {
		//update API to only query relevant agency.
		if (!wallet) return;
		let data = await fetch(`${process.env.REACT_APP_DEFAULT_AGENCY_API}/vendors/${wallet.address}`).then(r => {
			if (!r.ok) throw Error(r.message);
			return r.json();
		});

		if (!data.agencies.length) return history.push('/setup/idcard');
		let status = data.agencies[0].status;

		if (status !== 'active') {
			let dagency = Object.assign(agency, { isApproved: false });
			await DataService.updateAgency(dagency.address, dagency);
			history.push('/setup/pending');
		}
	};

	useEffect(() => {
		if (agency)
			TokenService(agency.address)
				.getBalance()
				.then(bal => setTokenBalance(bal.toNumber()));
		let timer1 = null;
		(async () => {
			let txs = await DataService.listTx();
			addRecentTx(txs.slice(0, 3));
			const timer = setTimeout(() => {
				setShowPageLoader(false);
			}, 300);
			timer1 = setTimeout(async () => {
				await checkVendorStatus();
			}, 3000);
			return () => {
				clearTimeout(timer);
				clearTimeout(timer1);
			};
		})();
		return function cleanup() {
			if (timer1) clearTimeout(timer1);
		};
	}, []);

	if (!hasWallet) {
		return <Redirect to="/setup" />;
	}

	if (agency && !agency.isApproved) {
		return <Redirect to="/setup/pending" />;
	}

	return (
		<>
			{showPageLoader && (
				<div id="loader">
					<img src="/assets/img/brand/icon-white-128.png" alt="icon" className="loading-icon" />
				</div>
			)}
			<Loading showModal={loading !== null} message={loading} />
			<div id="appCapsule">
				<div className="section wallet-card-section pt-1">
					<div className="wallet-card">
						<div className="balance">
							<div className="left">
								<span className="title">Your Token Balance</span>
								<h1 className="total">{tokenBalance}</h1>
							</div>
							<div className="right"></div>
						</div>
					</div>
				</div>

				<div className="section mt-2">
					<div className="card">
						<div className="card-header">Recent Transactions</div>
						<div className="card-body">
							<TransactionList limit="3" transactions={recentTx} />
						</div>
					</div>
				</div>

				{wallet && (
					<div className="section mt-2 mb-4">
						<div className="card text-center">
							<div className="card-header">Your Address</div>
							<div className="card-body">
								<div className="card-text" ref={cardBody}>
									<QRCode value={wallet.address} size={calcQRWidth()} />
									<div className="mt-1" style={{ fontSize: 13 }}>
										{wallet.address}
									</div>
									<div className="mt-2" style={{ fontSize: 9, lineHeight: 1.5 }}>
										This QR Code (address) is your unique identity. Use this to receive digital
										documents, assets or verify your identity.
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="text-center mt-4">
					{hasWallet && !wallet && <strong>Tap on lock icon to unlock</strong>}
				</div>
			</div>
		</>
	);
}
