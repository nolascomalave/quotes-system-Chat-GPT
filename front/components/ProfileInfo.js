import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';

// Material UI Components:
import {Button, Divider, Skeleton} from '@mui/material';

// Icons:
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';


export default function ProfileInfo({info, resetPassword, changeState, deleteFn}){
	const userNav = useSelector(state => state.session.user);
	const [ accessRoles, setAccessRoles ] = useState({User: true, Admin: false, Master: false});

	useEffect(() => {
		setAccessRoles({...accessRoles, [userNav.role]: true});
	}, []);

	return (
		<section className='profile-info'>
			<div className="profile-info__principal">
				<div className="profile-info__principal__image">
					{!info ? (
						<>
							<Skeleton variant="circular" width={'7.5em'} height={'7.5em'} className="profile-info__principal__image__skeleton_img"/>
							<Skeleton width={'7.5em'} height={'2.5em'} className="profile-info__principal__image__skeleton_title"/>
							<Skeleton width={'2.5em'} height={'1.5em'} className="profile-info__principal__image__skeleton_subtitle"/>
						</>
					) : (
						<>
							

							{!!info.photo ? (
								<img src={process.env.API + 'files/' + (!info.username ? 'customers' : 'users') + '/photos/' + info.photo} className='profile-info__principal__image__primary' />
							) : (
								<div className='profile-info__principal__image__alternative centerFlex'>
									<AccountBoxIcon/>
								</div>
							)}

							{(!!info.natural || !!info.username) ? (
								<h3 className='profile-info__principal__image__title'>{info.first_name + ' ' + (info.second_name ? (info.second_name + ' ') : '') + ' ' + info.first_last_name + (info.second_last_name ? (' ' + info.second_last_name) : '')}</h3>
							) : (
								<h3 className='profile-info__principal__image__title'>{info.name}</h3>
							) }

							<p className='profile-info__principal__image__subtitle'>{info.username ?? (!info.natural ? 'Legal' : 'Natural')}</p>
						</>
					)}
				</div>
				<div className="profile-info__principal__resume">

					{(!info || (!!info && (accessRoles.Master === true || accessRoles.Admin === true))) ? (
						<>
							<Divider/>
							<div className='profile-info__principal__resume__actions'>

								<p className='profile-info__principal__resume__actions__title'>Actions:</p>

								{!info ? (
									<Skeleton width={'10em'} height={'3em'} className="profile-info__principal__resume__actions__skeleton_buttons"/>
								) : (
									<>
										<Link href={`/${!info.username ? 'customers' : 'users'}/edit/${info[!info.username ? 'id' : 'username']}`}>
											<Button className='profile-info__principal__resume__actions__button' title='Edit'>
												<EditIcon/>
											</Button>
										</Link>

										{((userNav.username !== info.username) || !!info.username) ? (
											<>
												{!!info.username ? (
													<>
														<Button
															className='profile-info__principal__resume__actions__button'
															title='Reset Password'
															onClick={resetPassword}
														>
															<LockResetIcon/>
														</Button>

														{/* <Button
															className='profile-info__principal__resume__actions__button'
															title='Change Role'
															onClick={()=> null}
														>
															<VpnKeyIcon/>
														</Button> */}

														<Button
															className='profile-info__principal__resume__actions__button'
															title={info._enable ? 'Inactivate' : 'Activate'}
															onClick={changeState}
														>
															{info._enable ? <VisibilityOffIcon/> : <VisibilityIcon/>}
														</Button>
													</>
												) : null }

												{!info._enable ? (
													<Button
														className='profile-info__principal__resume__actions__button'
														title='Delete'
														onClick={deleteFn}
													>
														<DeleteIcon/>
													</Button>
												) : null}
											</>
										) : null}
									</>
								)}

							</div>
						</>
					) :  null}
				</div>
			</div>

			<div className='profile-info__data'>
				<p className='profile-info__data__title'>{!!info ? (!!info.username ? 'User ' : 'Customer ') : ''}Information:</p>
				<div className='profile-info__data__form'>
					{!info ? (
						<>
							<Skeleton width={'12em'} height={'2em'} className="profile-info__data__form__skeleton_cell"/>
							<Skeleton width={'12em'} height={'2em'} className="profile-info__data__form__skeleton_cell"/>
							<Skeleton width={'12em'} height={'2em'} className="profile-info__data__form__skeleton_cell"/>
							<Skeleton width={'12em'} height={'2em'} className="profile-info__data__form__skeleton_cell"/>
							<Skeleton width={'12em'} height={'2em'} className="profile-info__data__form__skeleton_cell"/>
							<Skeleton width={'12em'} height={'2em'} className="profile-info__data__form__skeleton_cell"/>
							<Skeleton width={'12em'} height={'2em'} className="profile-info__data__form__skeleton_cell"/>
							<Skeleton width={'12em'} height={'2em'} className="profile-info__data__form__skeleton_cell"/>
							<Skeleton width={'100%'} height={'4em'} className="profile-info__data__form__skeleton_cell"/>
						</>
					) : (
						<>
							{(!!info.natural || !!info.username) ? (
								<>
									<div className='profile-info__data__form__cell'>
										<p class='title'>First Name:</p>
										<p class='value'>{info.first_name}</p>
									</div>

									{info.second_name ? (
										<div className='profile-info__data__form__cell'>
											<p class='title'>Second Name:</p>
											<p class='value'>{info.second_name}</p>
										</div>
									) : null}

									<div className='profile-info__data__form__cell'>
										<p class='title'>First Last Name:</p>
										<p class='value'>{info.first_last_name}</p>
									</div>

									{info.second_last_name ? (
										<div className='profile-info__data__form__cell'>
											<p class='title'>Second Last Name:</p>
											<p class='value'>{info.second_last_name}</p>
										</div>
									) : null}

									<div className='profile-info__data__form__cell'>
										<p class='title'>Gender:</p>
										<p class='value'>{info.gender}</p>
									</div>

									<div className='profile-info__data__form__cell'>
										<p class='title'>Social Security Number:</p>
										<p class='value'>{info.SSN}</p>
									</div>
								</>
							) : (
								<div className='profile-info__data__form__cell' style={{width: '100%'}}>
									<p class='title'>Name:</p>
									<p class='value'>{info.name}</p>
								</div>
							) }

							<div className='profile-info__data__form__cell'>
								<p class='title'>Email:</p>
								<p class='value'>{info.email}</p>
							</div>

							<div className='profile-info__data__form__cell'>
								<p class='title'>Phone Number:</p>
								<p class='value'>{info.phone}</p>
							</div>

							{info.phone_secondary ? (
								<div className='profile-info__data__form__cell'>
									<p class='title'>Phone Number (optional):</p>
									<p class='value'>{info.phone_secondary}</p>
								</div>
							) : null}

							{ ((!info.natural && !info.username) && !!info.description) ? (
								<div className='profile-info__data__form__cell all'>
									<p class='title'>Description:</p>
									<p class='value'>{info.description}</p>
								</div>
							) : null }

							{info.address ? (
								<div className='profile-info__data__form__cell all'>
									<p class='title'>Address:</p>
									<p class='value'>{info.address}</p>
								</div>
							) : null}
						</>
					)}
				</div>
			</div>
		</section>
	);
}