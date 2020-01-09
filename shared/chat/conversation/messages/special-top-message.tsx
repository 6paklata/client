import * as Constants from '../../../constants/chat2'
import * as React from 'react'
import * as RPCTypes from '../../../constants/types/rpc-gen'
import * as Types from '../../../constants/types/chat2'
import * as Chat2Gen from '../../../actions/chat2-gen'
import ProfileResetNotice from './system-profile-reset-notice/container'
import RetentionNotice from './retention-notice/container'
import shallowEqual from 'shallowequal'
import * as Kb from '../../../common-adapters'
import * as Container from '../../../util/container'
import * as Styles from '../../../styles'
import NewChatCard from './cards/new-chat'
import HelloBotCard from './cards/hello-bot'
import MakeTeamCard from './cards/make-team'
import * as FsConstants from '../../../constants/fs'
import * as FsTypes from '../../../constants/types/fs'

type OwnProps = {
  conversationIDKey: Types.ConversationIDKey
  measure: (() => void) | null
}

type Props = {
  conversationIDKey: Types.ConversationIDKey
  createConversationDisallowedUsers: Array<string>
  createConversationErrorDescription: string
  createConversationErrorHeader: string
  hasOlderResetConversation: boolean
  isHelloBotConversation: boolean
  isSelfConversation: boolean
  loadMoreType: 'moreToLoad' | 'noMoreToLoad'
  measure: (() => void) | null
  onCreateWithoutThem: (() => void) | null
  openPrivateFolder: () => void
  pendingState: 'waiting' | 'error' | 'done'
  showRetentionNotice: boolean
  showTeamOffer: boolean
}

class TopMessage extends React.PureComponent<Props> {
  componentDidUpdate(prevProps: Props) {
    if (this.props.measure && !shallowEqual(this.props, prevProps)) {
      this.props.measure()
    }
  }

  render() {
    return (
      <Kb.Box>
        {this.props.loadMoreType === 'noMoreToLoad' && this.props.showRetentionNotice && (
          <RetentionNotice conversationIDKey={this.props.conversationIDKey} measure={this.props.measure} />
        )}
        <Kb.Box style={styles.spacer} />
        {this.props.hasOlderResetConversation && (
          <ProfileResetNotice conversationIDKey={this.props.conversationIDKey} />
        )}
        {this.props.pendingState === 'waiting' && (
          <Kb.Text type="BodySmallSemibold" style={styles.loading}>
            Loading...
          </Kb.Text>
        )}
        {this.props.pendingState === 'error' && (
          <Kb.Box2
            direction="vertical"
            fullWidth={true}
            fullHeight={true}
            gap="small"
            gapStart={true}
            centerChildren={true}
          >
            <Kb.Icon color={Styles.globalColors.black_50} sizeType="Huge" type="iconfont-warning" />
            <Kb.Text type="HeaderBig">{this.props.createConversationErrorHeader} </Kb.Text>
            <Kb.Text type="Body" style={styles.errorText} selectable={true}>
              {this.props.createConversationErrorDescription}
            </Kb.Text>
          </Kb.Box2>
        )}
        {this.props.loadMoreType === 'noMoreToLoad' &&
          !this.props.showRetentionNotice &&
          this.props.pendingState === 'done' && (
            <Kb.Box style={styles.more}>
              {this.props.isHelloBotConversation ? (
                <HelloBotCard />
              ) : (
                <NewChatCard
                  self={this.props.isSelfConversation}
                  openPrivateFolder={this.props.openPrivateFolder}
                />
              )}
            </Kb.Box>
          )}
        {this.props.showTeamOffer && (
          <Kb.Box style={styles.more}>
            <MakeTeamCard conversationIDKey={this.props.conversationIDKey} />
          </Kb.Box>
        )}
        {this.props.loadMoreType === 'moreToLoad' && this.props.pendingState !== 'error' && (
          <Kb.Box style={styles.more}>
            <Kb.Text type="BodyBig">
              <Kb.Emoji size={16} emojiName=":moyai:" />
            </Kb.Text>
            <Kb.Text type="BodySmallSemibold">Digging ancient messages...</Kb.Text>
          </Kb.Box>
        )}
      </Kb.Box>
    )
  }
}

const styles = Styles.styleSheetCreate(
  () =>
    ({
      errorText: {
        padding: Styles.globalMargins.medium,
      },
      loading: {
        marginLeft: Styles.globalMargins.small,
      },
      more: {
        ...Styles.globalStyles.flexBoxColumn,
        alignItems: 'center',
        paddingBottom: Styles.globalMargins.medium,
        width: '100%',
      },
      spacer: {
        height: Styles.globalMargins.small,
      },
    } as const)
)

export default Container.namedConnect(
  (state, ownProps: OwnProps) => {
    const hasLoadedEver = state.chat2.messageOrdinals.get(ownProps.conversationIDKey) !== undefined
    const meta = Constants.getMeta(state, ownProps.conversationIDKey)
    const participantInfo = Constants.getParticipantInfo(state, ownProps.conversationIDKey)

    let pendingState: Props['pendingState']
    switch (ownProps.conversationIDKey) {
      case Constants.pendingWaitingConversationIDKey:
        pendingState = 'waiting'
        break
      case Constants.pendingErrorConversationIDKey:
        pendingState = 'error'
        break
      default:
        pendingState = 'done'
        break
    }
    const loadMoreType =
      state.chat2.moreToLoadMap.get(ownProps.conversationIDKey) !== false
        ? ('moreToLoad' as const)
        : ('noMoreToLoad' as const)
    const showTeamOffer =
      hasLoadedEver &&
      loadMoreType === 'noMoreToLoad' &&
      meta.teamType === 'adhoc' &&
      participantInfo.all.length > 2
    const hasOlderResetConversation = meta.supersedes !== Constants.noConversationIDKey
    // don't show default header in the case of the retention notice being visible
    const showRetentionNotice =
      meta.retentionPolicy.type !== 'retain' &&
      !(meta.retentionPolicy.type === 'inherit' && meta.teamRetentionPolicy.type === 'retain')
    const isHelloBotConversation =
      hasLoadedEver &&
      meta.teamType === 'adhoc' &&
      participantInfo.all.length === 2 &&
      participantInfo.all.includes('hellobot')
    const isSelfConversation =
      meta.teamType === 'adhoc' &&
      participantInfo.all.length === 1 &&
      participantInfo.all.includes(state.config.username)
    return {
      conversationIDKey: ownProps.conversationIDKey,
      createConversationError: state.chat2.createConversationError,
      hasOlderResetConversation,
      isHelloBotConversation,
      isSelfConversation,
      loadMoreType,
      measure: ownProps.measure,
      pendingState,
      showRetentionNotice,
      showTeamOffer,
      username: state.config.username,
    }
  },
  dispatch => ({
    _onCreateWithoutThem: (allowedUsers: Array<string>) =>
      dispatch(Chat2Gen.createCreateConversation({participants: allowedUsers})),
    _openPrivateFolder: (username: string) =>
      dispatch(
        FsConstants.makeActionForOpenPathInFilesTab(FsTypes.stringToPath(`/keybase/private/${username}`))
      ),
  }),
  (stateProps, dispatchProps, __: OwnProps) => {
    const {username, ...props} = stateProps
    let createConversationDisallowedUsers = []
    let createConversationErrorDescription = ''
    let createConversationErrorHeader = ''
    let onCreateWithoutThem: (() => void) | null = null
    if (stateProps.createConversationError) {
      const {allowedUsers, code, disallowedUsers, message} = stateProps.createConversationError
      if (code === RPCTypes.StatusCode.scteamcontactsettingsblock) {
        if (disallowedUsers.length === 1 && allowedUsers.length === 0) {
          // One-on-one conversation.
          createConversationErrorHeader = `You cannot start a conversation with @${disallowedUsers[0]}.`
          createConversationErrorDescription = `@${disallowedUsers[0]}'s contact restrictions prevent you from getting in touch. Contact them outside Keybase to proceed.`
        } else {
          // Group conversation.
          createConversationErrorHeader = 'The following people cannot be added to the conversation:'
          createConversationErrorDescription =
            'Their contact restrictions prevent you from getting in touch. Contact them outside Keybase to proceed.'
          if (disallowedUsers.length > 0 && allowedUsers.length > 0) {
            onCreateWithoutThem = () => dispatchProps._onCreateWithoutThem(allowedUsers)
          }
        }
      } else {
        createConversationErrorHeader = 'There was an error creating the conversation.'
        createConversationErrorDescription = message
      }
    }
    return {
      createConversationDisallowedUsers,
      createConversationErrorDescription,
      createConversationErrorHeader,
      onCreateWithoutThem,
      openPrivateFolder: () => dispatchProps._openPrivateFolder(username),
      ...props,
    }
  },
  'TopMessage'
)(TopMessage)
