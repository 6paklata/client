import * as React from 'react'
import * as Kb from '../common-adapters'
import * as Styles from '../styles'
import * as Container from '../util/container'

type OwnProps = Container.RouteProps<Props>

type Props = {
  source: 'newFolder' | 'teamAddSomeFailed' | 'teamAddAllFailed' | 'walletsRequest' | 'misc'
  usernames: Array<string>
}

const ContactRestricted = (props: Props) => {
  const dispatch = Container.useDispatch()
  const nav = Container.useSafeNavigation()
  const onBack = React.useCallback(() => dispatch(nav.safeNavigateUpPayload()), [dispatch, nav])
  let header = ''
  let description = ''
  let disallowedUsers: Array<string> = []
  switch (props.source) {
    case 'walletsRequest':
      header = `You cannot request a payment from @${props.usernames[0]}.`
      description = `@${props.usernames[0]}'s contact restrictions prevent you from requesting a payment. Contact them outside Keybase to proceed.`
      break
    case 'newFolder':
      header = `You cannot open a private folder with @${props.usernames[0]}.`
      description = `@${props.usernames[0]}'s contact restrictions prevent you from opening a private folder with them. Contact them outside Keybase to proceed.`
      break
    case 'teamAddAllFailed':
      header = 'The following people could not be added to the team.'
      description =
        'Their contact restrictions prevent you from adding them. Contact them outside Keybase to proceed.'
      disallowedUsers = props.usernames
      break
    case 'teamAddSomeFailed':
      header = 'Some of the users could not be added to the team.'
      description =
        'Their contact restrictions prevent you from adding them. Contact them outside Keybase to proceed.'
      disallowedUsers = props.usernames
      break
  }
  return (
    <Kb.Modal
      onClose={onBack}
      header={
        Styles.isMobile
          ? {
              leftButton: <Kb.BackButton onClick={onBack} />,
            }
          : undefined
      }
      footer={{
        content: (
          <Kb.ButtonBar direction="row" fullWidth={true} style={styles.buttonBar}>
            <Kb.WaitingButton
              type="Default"
              label="Okay"
              onClick={onBack}
              style={styles.button}
              waitingKey={null}
            />
          </Kb.ButtonBar>
        ),
        hideBorder: true,
      }}
    >
      <Kb.Box2
        alignItems="center"
        direction="vertical"
        gap="small"
        gapStart={true}
        centerChildren={true}
        fullWidth={true}
        style={styles.container}
        noShrink={true}
      >
        <Kb.Icon type="iconfont-warning" sizeType="Huge" color={Styles.globalColors.black_20} />
        <Kb.Text center={true} style={styles.text} type="Header" lineClamp={2}>
          {header}
        </Kb.Text>
        <Kb.Text center={true} style={styles.text} type="BodyBig">
          {description}
        </Kb.Text>
        {props.usernames.length > 0 &&
          (props.source === 'teamAddAllFailed' || props.source === 'teamAddSomeFailed') && (
            <>
              {props.usernames.map((username, idx) => (
                <Kb.ListItem2
                  key={username}
                  type={Styles.isMobile ? 'Large' : 'Small'}
                  icon={<Kb.Avatar size={Styles.isMobile ? 48 : 32} username={username} />}
                  firstItem={idx === 0}
                  body={
                    <Kb.Box2 direction="vertical" fullWidth={true}>
                      <Kb.Text type="BodySemibold">{username}</Kb.Text>
                    </Kb.Box2>
                  }
                />
              ))}
            </>
          )}
      </Kb.Box2>
    </Kb.Modal>
  )
}

const styles = Styles.styleSheetCreate(() => ({
  button: {
    flex: 1,
  },
  buttonBar: {
    marginBottom: Styles.globalMargins.medium,
    marginTop: Styles.globalMargins.small,
    minHeight: undefined,
  },
  container: Styles.platformStyles({
    isElectron: {
      ...Styles.padding(0, Styles.globalMargins.medium),
      flex: 1,
    },
  }),
  icon: {
    marginBottom: Styles.globalMargins.medium,
    marginTop: Styles.globalMargins.xlarge,
  },
  text: {
    margin: Styles.globalMargins.small,
  },
}))

export default Container.connect(
  () => ({}),
  () => ({}),
  (_, __, ownProps: OwnProps) => ({
    source: Container.getRouteProps(ownProps, 'source', 'misc'),
    usernames: Container.getRouteProps(ownProps, 'usernames', []),
  })
)(ContactRestricted)
